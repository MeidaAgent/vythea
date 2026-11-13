import { admin, sha256Hex, type Admin } from "./admin";
import { cors, fail } from "./http";

const OPENROUTER = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

const MAX_BODY_BYTES = 4_000_000;
/** The answer length assumed when a request does not say, and so the amount of credit set aside. */
const DEFAULT_MAX_OUT = 4096;
/** Requests one key may have running at once. */
const MAX_IN_FLIGHT = 4;

type Key = {
  user_id: string;
  key_id: string;
  plan: string;
  rpm_limit: number;
  daily_limit_usd: number;
  credits_usd: number;
  held_usd: number;
  spent_today_usd: number;
  requests_last_minute: number;
  in_flight: number;
  team_id: string | null;
  team_paid: boolean | null;
};

type Model = {
  id: string;
  openrouter_id: string | null;
  input_per_m: number | null;
  output_per_m: number | null;
  provider_input_per_m: number | null;
  provider_output_per_m: number | null;
  context_k: number | null;
  output_k: number | null;
};

type Usage = { prompt_tokens?: number; completion_tokens?: number; cost?: number } & Record<string, unknown>;
type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

let cached: {
  markup: number;
  markupPro: number;
  proRpm: number;
  dataCollection: string;
  freeModel: string;
  freeRequests: number;
  at: number;
} | null = null;

/** The markup, the privacy setting and the free allowance, read from the database and kept for a minute. */
async function settings(db: Admin) {
  if (cached && Date.now() - cached.at < 60_000) return cached;
  const { data } = await db
    .from("settings")
    .select("key,value")
    .in("key", ["markup", "markup_pro", "pro_rpm_multiplier", "data_collection", "free_model", "free_requests"]);
  const rows = new Map((data ?? []).map((r) => [r.key as string, r.value as unknown]));
  cached = {
    markup: num(rows.get("markup"), 0.2),
    markupPro: num(rows.get("markup_pro"), 0.1),
    proRpm: Math.max(1, num(rows.get("pro_rpm_multiplier"), 3)),
    dataCollection: rows.get("data_collection") === "allow" ? "allow" : "deny",
    freeModel: typeof rows.get("free_model") === "string" ? (rows.get("free_model") as string) : "",
    freeRequests: Math.max(0, Math.floor(num(rows.get("free_requests"), 0))),
    at: Date.now(),
  };
  return cached;
}

/** The provider key, with the stray spaces, line breaks or quotes a paste can leave around it taken off. */
function providerKey() {
  return (process.env.OPENROUTER_API_KEY ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

/** What a model's provider said went wrong, turned into an answer that does not leak how we are set up. */
async function upstreamFailure(res: Response) {
  let message = "";
  try {
    const body = (await res.json()) as { error?: { message?: unknown } };
    message = typeof body.error?.message === "string" ? body.error.message : "";
  } catch {
    /* no readable body */
  }
  if (res.status === 400 || res.status === 413 || res.status === 422) {
    return fail(400, "invalid_request", message || "The model did not accept this request.");
  }
  if (res.status === 404) {
    console.error("gateway upstream 404:", message.slice(0, 200));
    return fail(503, "model_unavailable", "That model isn't available right now.");
  }
  if (res.status === 429)
    return fail(429, "rate_limit_exceeded", "The model is busy. Please try again shortly.", {
      "Retry-After": "10",
    });
  // Our own provider key or balance (401/402/403) is our problem, not the caller's.
  // The reason goes to our own logs only, never to the caller.
  console.error(`gateway upstream ${res.status}:`, message.slice(0, 200));
  return fail(503, "provider_unavailable", "The model provider is unavailable. Please try again shortly.");
}

/** Take the provider-specific parts out of an answer before it leaves. */
function clean(obj: Json, modelId: string) {
  obj.model = modelId;
  delete obj.provider;
  if (isObject(obj.usage)) {
    delete obj.usage.cost;
    delete obj.usage.cost_details;
  }
  return obj;
}

/** POST /v1/chat/completions: check the key, set the credit aside, forward, stream back, charge. */
export async function chatCompletions(req: Request): Promise<Response> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token)
    return fail(401, "invalid_api_key", "Missing API key. Send it as: Authorization: Bearer <key>.");
  if (num(req.headers.get("content-length")) > MAX_BODY_BYTES) {
    return fail(413, "request_too_large", "The request is too large.");
  }

  let db: Admin;
  try {
    db = admin();
  } catch {
    return fail(503, "gateway_unavailable", "The gateway isn't configured yet.");
  }

  // 1. Whose key is this, and what may it do?
  const verified = await db.rpc("gateway_verify_key", { p_hash: await sha256Hex(token) });
  if (verified.error) return fail(503, "gateway_unavailable", "Please try again in a moment.");
  const key = (verified.data as Key[] | null)?.[0];
  if (!key) return fail(401, "invalid_api_key", "That API key isn't valid.");

  let body: Json;
  try {
    const parsed: unknown = await req.json();
    if (!isObject(parsed)) throw new Error("not an object");
    body = parsed;
  } catch {
    return fail(400, "invalid_json", "The request body must be a JSON object.");
  }
  if (typeof body.model !== "string" || !Array.isArray(body.messages) || body.messages.length === 0) {
    return fail(400, "invalid_request", "Both `model` and a non-empty `messages` list are required.");
  }

  // 2. Which model, and at what price?
  const found = await db
    .from("models")
    .select(
      "id,openrouter_id,input_per_m,output_per_m,provider_input_per_m,provider_output_per_m,context_k,output_k",
    )
    .eq("id", body.model)
    .eq("active", true)
    .maybeSingle();
  const model = found.data as Model | null;
  if (!model) return fail(404, "model_not_found", `The model \`${body.model}\` does not exist.`);
  if (!model.openrouter_id || model.input_per_m == null || model.output_per_m == null) {
    return fail(503, "model_unavailable", "That model isn't available right now.");
  }

  // 3. The key's own limits; a paid plan lifts the requests per minute and lowers the markup.
  const cfg = await settings(db);
  // Paid benefits come from the person's own Pro plan, or from a running Team plan on the team the key bills to.
  const paid = key.plan === "pro" || key.plan === "team" || Boolean(key.team_id && key.team_paid);
  if (num(key.requests_last_minute) >= key.rpm_limit * (paid ? cfg.proRpm : 1)) {
    return fail(429, "rate_limit_exceeded", "Too many requests. Please slow down.", { "Retry-After": "10" });
  }
  if (num(key.spent_today_usd) >= num(key.daily_limit_usd)) {
    return fail(
      429,
      "daily_limit_reached",
      "This key reached its daily spending limit. It resets at midnight UTC.",
    );
  }
  if (num(key.in_flight) >= MAX_IN_FLIGHT) {
    return fail(429, "too_many_concurrent_requests", "Too many requests at once for this key.", {
      "Retry-After": "5",
    });
  }

  // 4. The most this request could cost, set aside before it runs.
  const inputTokens = Math.ceil(JSON.stringify({ m: body.messages, t: body.tools ?? null }).length / 3);
  if (model.context_k && inputTokens > model.context_k * 1000) {
    return fail(400, "context_length_exceeded", "The conversation is longer than this model can read.");
  }
  const cap = (model.output_k ?? 8) * 1000;
  const asked = Math.floor(num(body.max_tokens ?? body.max_completion_tokens, DEFAULT_MAX_OUT));
  const maxOut = Math.max(1, Math.min(asked, cap));
  const estimate = (inputTokens * num(model.input_per_m) + maxOut * num(model.output_per_m)) / 1e6;
  const reserve = Math.max(0.000001, Math.ceil(estimate * 1e6) / 1e6);

  // The free model takes one of the account's free requests first; once they are used up it is paid like any other.
  let isFree = false;
  let held: { data: unknown; error: { code?: string; message: string } | null } | null = null;
  if (cfg.freeModel && model.id === cfg.freeModel && cfg.freeRequests > 0) {
    const free = await db.rpc("gateway_reserve_free", { p_key_id: key.key_id, p_limit: cfg.freeRequests });
    if (!free.error) {
      isFree = true;
      held = free;
    } else if (free.error.code !== "P0003" && !/free allowance used/i.test(free.error.message)) {
      return fail(503, "gateway_unavailable", "Please try again in a moment.");
    }
  }
  if (!held) held = await db.rpc("gateway_reserve", { p_key_id: key.key_id, p_max_cost: reserve });
  if (held.error) {
    if (held.error.code === "P0004" || /member limit reached/i.test(held.error.message)) {
      return fail(
        429,
        "daily_limit_reached",
        "You reached your daily limit on this team. It resets at midnight UTC, or ask the team owner to raise it.",
      );
    }
    if (/insufficient team credit/i.test(held.error.message)) {
      return fail(
        402,
        "insufficient_quota",
        "The team doesn't have enough credit for this request. Ask the team owner to add credit.",
      );
    }
    if (held.error.code === "P0002" || /insufficient credit/i.test(held.error.message)) {
      return fail(
        402,
        "insufficient_quota",
        "Not enough credit for this request. Add credit in your dashboard.",
      );
    }
    return fail(503, "gateway_unavailable", "Please try again in a moment.");
  }
  const holdId = held.data as string;
  const release = () => db.rpc("gateway_release", { p_hold_id: holdId });

  // 5. Forward it to the provider: our model name swapped for theirs, and nothing the caller sent that could
  // steer it to a different model or provider.
  const upstream: Json = {
    ...body,
    model: model.openrouter_id,
    max_tokens: maxOut,
    usage: { include: true },
    provider: { data_collection: cfg.dataCollection },
  };
  for (const field of ["max_completion_tokens", "models", "route", "plugins", "transforms", "preset"]) {
    delete upstream[field];
  }
  const streaming = body.stream === true;
  if (streaming) {
    upstream.stream_options = {
      ...(isObject(body.stream_options) ? body.stream_options : {}),
      include_usage: true,
    };
  }

  let res: Response;
  try {
    res = await fetch(`${OPENROUTER}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerKey()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vythea.com",
        "X-Title": "Vythea",
      },
      body: JSON.stringify(upstream),
      signal: req.signal,
    });
  } catch {
    await release();
    return fail(502, "upstream_error", "The model provider could not be reached.");
  }
  if (!res.ok) {
    await release();
    return upstreamFailure(res);
  }

  // 6. Take what it really cost, once.
  const providerIn = num(model.provider_input_per_m);
  const providerOut = num(model.provider_output_per_m);
  let settled = false;
  const settle = async (usage: Usage | null, outputChars: number, status: string) => {
    if (settled) return;
    settled = true;
    const promptTokens = usage ? num(usage.prompt_tokens) : inputTokens;
    const completionTokens = usage ? num(usage.completion_tokens) : Math.ceil(outputChars / 4);
    const providerCost = Number.isFinite(Number(usage?.cost))
      ? num(usage?.cost)
      : (promptTokens * providerIn + completionTokens * providerOut) / 1e6;
    const result = await db.rpc("gateway_settle", {
      p_hold_id: holdId,
      p_model: model.id,
      p_in: Math.round(promptTokens),
      p_out: Math.round(completionTokens),
      p_provider_cost: round6(providerCost),
      p_charged: isFree ? 0 : round6(providerCost * (1 + (paid ? cfg.markupPro : cfg.markup))),
      p_status: status,
    });
    // The hold lapses by itself after 15 minutes, so a failure here never locks credit for good.
    if (result.error) console.error("gateway_settle failed", result.error.code);
  };

  if (!streaming) {
    const answer = (await res.json()) as Json;
    await settle(isObject(answer.usage) ? (answer.usage as Usage) : null, 0, "ok");
    return new Response(JSON.stringify(clean(answer, model.id)), {
      status: 200,
      headers: cors({ "Content-Type": "application/json", "Cache-Control": "no-store" }),
    });
  }

  // Streaming: pass every piece on as it arrives, and read the usage out of the last one.
  const reader = res.body?.getReader();
  if (!reader) {
    await release();
    return fail(502, "upstream_error", "The model provider sent an empty answer.");
  }
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let pending = "";
  let usage: Usage | null = null;
  let outputChars = 0;

  const line = (text: string) => {
    if (!text.startsWith("data:")) return text;
    const payload = text.slice(5).trim();
    if (!payload || payload === "[DONE]") return text;
    try {
      const chunk = JSON.parse(payload) as Json;
      if (isObject(chunk.usage)) usage = chunk.usage as Usage;
      const choices = chunk.choices;
      if (Array.isArray(choices) && isObject(choices[0]) && isObject(choices[0].delta)) {
        const piece = choices[0].delta.content;
        if (typeof piece === "string") outputChars += piece.length;
      }
      return `data: ${JSON.stringify(clean(chunk, model.id))}`;
    } catch {
      return text;
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      // Keep reading until there is something to send (a chunk may hold no complete line yet), or it ends.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          if (pending) controller.enqueue(encoder.encode(line(pending)));
          await settle(usage, outputChars, "ok");
          controller.close();
          return;
        }
        pending += decoder.decode(value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        if (lines.length === 0) continue;
        for (const text of lines) controller.enqueue(encoder.encode(`${line(text)}\n`));
        return;
      }
    },
    async cancel(reason) {
      await reader.cancel(reason).catch(() => undefined);
      await settle(usage, outputChars, "cancelled");
    },
  });

  return new Response(stream, {
    status: 200,
    headers: cors({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    }),
  });
}

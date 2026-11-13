import { createClient } from "@supabase/supabase-js";
import { cors, fail, preflight } from "@/lib/gateway/http";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  provider: string;
  context_k: number | null;
  output_k: number | null;
  input_per_m: number | null;
  output_per_m: number | null;
  tools: boolean;
  reasoning: boolean;
  vision: boolean;
};

/** Price per token as a plain decimal string ("0.00000005"), the way other gateways write it. */
const perToken = (perMillion: number | null) =>
  perMillion == null ? null : (perMillion / 1e6).toFixed(12).replace(/0+$/, "").replace(/\.$/, ".0");

/** GET /v1/models: the models a key can call, in the shape OpenAI-compatible tools read. Public, like the catalog itself. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fail(503, "gateway_unavailable", "The gateway isn't configured yet.");

  const { data, error } = await createClient(url, key, { auth: { persistSession: false } })
    .from("models")
    .select("id,name,provider,context_k,output_k,input_per_m,output_per_m,tools,reasoning,vision")
    .order("sort");
  if (error) return fail(503, "gateway_unavailable", "Please try again in a moment.");

  const models = ((data ?? []) as Row[]).map((m) => ({
    id: m.id,
    object: "model",
    created: 0,
    owned_by: m.provider.toLowerCase(),
    name: m.name,
    context_length: m.context_k ? m.context_k * 1000 : null,
    max_output_tokens: m.output_k ? m.output_k * 1000 : null,
    pricing: { prompt: perToken(m.input_per_m), completion: perToken(m.output_per_m) },
    supports: { tools: m.tools, reasoning: m.reasoning, vision: m.vision },
  }));

  return new Response(JSON.stringify({ object: "list", data: models }), {
    status: 200,
    headers: cors({ "Content-Type": "application/json", "Cache-Control": "public, max-age=60" }),
  });
}

export const OPTIONS = preflight;

import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { person, runJson, type RunRow } from "@/lib/cloud";

export const dynamic = "force-dynamic";

const MAX_FILES = 3_500_000;

/** GET /v1/runs: the account's recent runs, newest first. */
export async function GET(request: Request) {
  const p = await person(request);
  if (p.refusal) return p.refusal;
  const limit = Math.min(50, Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 20));
  const { data } = await admin()
    .from("cloud_runs")
    .select("id,thread,tier,status,prompt,answer,error,seconds,created_at,preview")
    .eq("user_id", p.who.userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return json({ runs: ((data ?? []) as RunRow[]).map(runJson) });
}

/** POST /v1/runs: a task to run on the person's own connected server. */
export async function POST(request: Request) {
  const p = await person(request);
  if (p.refusal) return p.refusal;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const prompt = text(body?.prompt, 20_000).trim();
  if (!prompt) return json({ error: "Say what the task should do." }, 400);
  const files = text(body?.files, MAX_FILES + 1);
  if (files.length > MAX_FILES) {
    return json({ error: "That folder is too large to send (over 3 MB). Use an https repository instead." }, 413);
  }
  const repo = text(body?.repo, 500);
  if (repo && !/^https:\/\/[^\s]+$/.test(repo)) return json({ error: "The repository must be an https:// address." }, 400);

  const { data, error } = await admin().rpc("cloud_run_create", {
    p_user: p.who.userId,
    p_prompt: prompt,
    p_repo: repo,
    p_branch: text(body?.branch, 200),
    p_tier: ["light", "normal", "heavy"].includes(String(body?.tier)) ? String(body?.tier) : "light",
    p_model: text(body?.model, 100),
    p_thread: /^[a-z0-9-]{1,40}$/i.test(String(body?.thread ?? "")) ? String(body?.thread) : "",
    p_files: files,
  });
  if (error) {
    if (/no server connected/i.test(error.message)) {
      return json({ error: "No server of yours is connected. Connect one under Dashboard > Cloud." }, 409);
    }
    if (/too many runs/i.test(error.message)) return json({ error: "You already have 3 runs going. Wait for one to finish." }, 429);
    return json({ error: "Please try again." }, 500);
  }
  return json(runJson(data as RunRow), 201);
}

export const OPTIONS = preflight;

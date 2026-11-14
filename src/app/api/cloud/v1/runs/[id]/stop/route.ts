import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { person, UUID } from "@/lib/cloud";

export const dynamic = "force-dynamic";

/** POST /v1/runs/{id}/stop: stop a run, queued or running. The server's agent sees it and ends the task. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const p = await person(request);
  if (p.refusal) return p.refusal;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return json({ error: "No such run." }, 404);
  await admin().rpc("cloud_run_stop", { p_run: id, p_user: p.who.userId });
  return json({ ok: true });
}

export const OPTIONS = preflight;

import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { machine, UUID } from "@/lib/cloud";

export const dynamic = "force-dynamic";

/** POST { type, ... }: a progress note from the running task. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const m = await machine(request);
  if (m.refusal) return m.refusal;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return json({ error: "No such run." }, 404);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || body.type !== "progress") return json({ error: "Not an event." }, 400);
  await admin().rpc("cloud_run_event", {
    p_run: id,
    p_machine: m.machine.id,
    p_data: { type: "progress", rounds: Number(body.rounds) || 0, doing: String(body.doing ?? "").slice(0, 300) },
  });
  return json({ ok: true });
}

export const OPTIONS = preflight;

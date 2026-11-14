import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { machine, UUID } from "@/lib/cloud";

export const dynamic = "force-dynamic";

/** POST { status, answer, error }: the task is over. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const m = await machine(request);
  if (m.refusal) return m.refusal;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return json({ error: "No such run." }, 404);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const status = body?.status === "done" ? "done" : "failed";
  const { error } = await admin().rpc("cloud_run_finish", {
    p_run: id,
    p_machine: m.machine.id,
    p_status: status,
    p_answer: String(body?.answer ?? ""),
    p_error: String(body?.error ?? ""),
    p_preview: String(body?.preview ?? ""),
  });
  return error ? json({ error: "Please try again." }, 500) : json({ ok: true });
}

export const OPTIONS = preflight;

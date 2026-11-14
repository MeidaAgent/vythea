import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { machine, UUID } from "@/lib/cloud";

export const dynamic = "force-dynamic";

/** GET: where a run stands, so the server can stop a task the person stopped. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const m = await machine(request);
  if (m.refusal) return m.refusal;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return json({ error: "No such run." }, 404);
  const { data } = await admin().from("cloud_runs").select("status").eq("id", id).eq("machine_id", m.machine.id).maybeSingle();
  return data ? json({ status: data.status }) : json({ error: "No such run." }, 404);
}

export const OPTIONS = preflight;

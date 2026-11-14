import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { person, runJson, UUID, type RunRow } from "@/lib/cloud";

export const dynamic = "force-dynamic";

/** GET /v1/runs/{id}: one run as it stands now. */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const p = await person(request);
  if (p.refusal) return p.refusal;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return json({ error: "No such run." }, 404);
  const { data } = await admin()
    .from("cloud_runs")
    .select("id,thread,tier,status,prompt,answer,error,seconds,created_at,preview")
    .eq("id", id)
    .eq("user_id", p.who.userId)
    .maybeSingle();
  return data ? json(runJson(data as RunRow)) : json({ error: "No such run." }, 404);
}

export const OPTIONS = preflight;

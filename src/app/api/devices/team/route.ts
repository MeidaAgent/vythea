import { admin } from "@/lib/gateway/admin";
import { json, signedOut, whoIs } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";

export const dynamic = "force-dynamic";

/** POST /devices/team { org_id }: choose where this computer's hosted models are billed. An empty id is the person's own credit. */
export async function POST(request: Request) {
  const who = await whoIs(request);
  if (!who) return signedOut();

  const body = (await request.json().catch(() => null)) as { org_id?: unknown } | null;
  const id = typeof body?.org_id === "string" ? body.org_id.trim() : "";
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    return json({ error: "That team could not be picked." }, 400);
  }

  const { error } = await admin().rpc("key_use_team", { p_key_id: who.id, p_team: id || null });
  if (error) return json({ error: "You're not in that team." }, 403);
  return json({ ok: true });
}

export const OPTIONS = preflight;

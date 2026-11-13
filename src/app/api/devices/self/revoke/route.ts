import { admin } from "@/lib/gateway/admin";
import { json, signedOut, whoIs } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";

export const dynamic = "force-dynamic";

/** POST /devices/self/revoke: the app signing this computer out. */
export async function POST(request: Request) {
  const who = await whoIs(request);
  if (!who) return signedOut();
  await admin().from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", who.id);
  return json({ ok: true });
}

export const OPTIONS = preflight;

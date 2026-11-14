import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";

export const dynamic = "force-dynamic";

/**
 * POST { state }: a server asking to be connected. The first call starts the wait; once the person has
 * approved it in the browser, a later call hands over the server's token, once.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { state?: unknown } | null;
  const state = typeof body?.state === "string" ? body.state : "";
  if (!/^[0-9a-f]{32}$/.test(state)) return json({ error: "Not a valid connection." }, 400);

  const db = admin();
  await db.rpc("cloud_connect_open", { p_state: state });
  const { data: token } = await db.rpc("cloud_connect_collect", { p_state: state });
  return typeof token === "string" ? json({ token }) : json({ pending: true });
}

export const OPTIONS = preflight;

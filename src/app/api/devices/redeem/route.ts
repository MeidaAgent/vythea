import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { displayName } from "@/lib/account";

export const dynamic = "force-dynamic";

/** POST /devices/redeem { state, code }: signing in with the code the page shows, when the browser can't reach the computer. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { state?: unknown; code?: unknown } | null;
  const state = typeof body?.state === "string" ? body.state : "";
  const code = typeof body?.code === "string" ? body.code : "";
  if (!/^[0-9a-f]{32}$/.test(state) || code.length < 4 || code.length > 20) {
    return json({ error: "That code did not work. Start /login again." }, 400);
  }

  const db = admin();
  const { data, error } = await db.rpc("redeem_device_code", { p_state: state, p_code: code });
  const row = data?.[0] as { token: string; user_id: string } | undefined;
  if (error || !row) return json({ error: "That code did not work. Start /login again." }, 400);

  const { data: found } = await db.auth.admin.getUserById(row.user_id);
  return json({
    token: row.token,
    name: found?.user ? displayName(found.user) : "Vythea user",
    email: found?.user?.email ?? "",
  });
}

export const OPTIONS = preflight;

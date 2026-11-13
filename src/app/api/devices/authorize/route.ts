import { NextResponse } from "next/server";
import { admin } from "@/lib/gateway/admin";
import { displayName } from "@/lib/account";
import { createClient, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** "Windows · app", from what the browser says it is running on. */
function describe(agent: string, client: string) {
  const os = /windows/i.test(agent) ? "Windows" : /mac os|macintosh/i.test(agent) ? "macOS" : /linux/i.test(agent) ? "Linux" : "Computer";
  return `${os} · ${client === "cli" ? "terminal" : "app"}`;
}

/**
 * POST { state, callback, client, mode }: the signed-in person allowing Vythea on a computer. The answer
 * is either where to send the browser (with the new token, to the computer itself only) or a one-time code.
 */
export async function POST(request: Request) {
  if (!hasSupabase) return NextResponse.json({ error: "Accounts are not switched on." }, { status: 503 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    state?: unknown;
    callback?: unknown;
    client?: unknown;
    mode?: unknown;
  } | null;
  const state = typeof body?.state === "string" ? body.state : "";
  const callback = typeof body?.callback === "string" ? body.callback : "";
  const client = body?.client === "cli" || body?.client === "app" ? body.client : null;
  if (!/^[0-9a-f]{32}$/.test(state) || !client) {
    return NextResponse.json({ error: "This sign-in link is not valid. Start again from Vythea." }, { status: 400 });
  }
  const info = describe(request.headers.get("user-agent") ?? "", client);
  const db = admin();

  if (body?.mode === "code") {
    const { data, error } = await db.rpc("open_device_code", {
      p_user: user.id,
      p_state: state,
      p_client: client,
      p_info: info,
    });
    if (error || typeof data !== "string") {
      return NextResponse.json({ error: "Please try again." }, { status: 500 });
    }
    return NextResponse.json({ code: data });
  }

  // The token only ever goes back to the computer's own loopback address, never to another site.
  if (!/^http:\/\/127\.0\.0\.1:\d{1,5}\/$/.test(callback)) {
    return NextResponse.json({ error: "This sign-in link is not valid. Start again from Vythea." }, { status: 400 });
  }
  const { data: token, error } = await db.rpc("mint_device", { p_user: user.id, p_client: client, p_info: info });
  if (error || typeof token !== "string") {
    const full = error?.message.includes("device limit");
    return NextResponse.json(
      { error: full ? "Too many computers are signed in. Sign one out on the Devices page first." : "Please try again." },
      { status: full ? 429 : 500 },
    );
  }
  const to = new URL(callback);
  to.searchParams.set("token", token);
  to.searchParams.set("state", state);
  to.searchParams.set("name", displayName(user));
  to.searchParams.set("email", user.email ?? "");
  return NextResponse.json({ redirect: to.toString() });
}

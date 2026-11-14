import { NextResponse } from "next/server";
import { admin } from "@/lib/gateway/admin";
import { createClient, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** POST { state, name }: the signed-in person approving a server that asked to be connected. */
export async function POST(request: Request) {
  if (!hasSupabase) return NextResponse.json({ error: "Accounts are not switched on." }, { status: 503 });
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { state?: unknown; name?: unknown } | null;
  const state = typeof body?.state === "string" ? body.state : "";
  if (!/^[0-9a-f]{32}$/.test(state)) return NextResponse.json({ error: "This link isn't valid." }, { status: 400 });
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";

  const { error } = await admin().rpc("cloud_connect_approve", { p_state: state, p_user: user.id, p_name: name });
  if (error) {
    const many = /too many servers/i.test(error.message);
    return NextResponse.json(
      { error: many ? "You already have 5 servers connected." : "This link has expired or was already used. Start again on the server." },
      { status: many ? 409 : 410 },
    );
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { safeNext } from "@/lib/auth";
import { createClient, hasSupabase } from "@/lib/supabase/server";

/** GitHub sends people back here with a one-time code; trade it for a session, then go on. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (hasSupabase && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=1`);
}

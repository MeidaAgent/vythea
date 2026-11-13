import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNext } from "@/lib/auth";
import { claimFree } from "@/lib/claim";
import { createClient, hasSupabase } from "@/lib/supabase/server";

/** GitHub sends people back here with a one-time code; trade it for a session, then go on. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (hasSupabase && code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Coming back from "claim the free requests": check the GitHub star with the token GitHub just gave.
      if (searchParams.get("claim") === "1" && data.user) {
        const result = await claimFree(data.user.id, data.session?.provider_token);
        return NextResponse.redirect(`${origin}/dashboard/billing?claim=${result}`);
      }

      // If they came through an invite link, credit it now. Only a brand-new account can claim.
      const store = await cookies();
      const invite = store.get("vy_ref")?.value;
      if (invite && /^[a-z0-9]{4,16}$/.test(invite)) {
        await supabase.rpc("claim_referral", { p_code: invite });
      }
      store.delete("vy_ref");
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=1`);
}

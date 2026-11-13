import { admin } from "@/lib/gateway/admin";
import { json, signedOut, whoIs } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { displayName } from "@/lib/account";

export const dynamic = "force-dynamic";

/** GET /me: who a token belongs to, and what they have. The app asks this to show the plan and credit. */
export async function GET(request: Request) {
  const who = await whoIs(request);
  if (!who) return signedOut();

  const db = admin();
  const [{ data: profile }, { data: found }] = await Promise.all([
    db.from("profiles").select("plan,credits_usd").eq("id", who.userId).single(),
    db.auth.admin.getUserById(who.userId),
  ]);
  const user = found?.user;
  await db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", who.id);

  return json({
    name: user ? displayName(user) : "Vythea user",
    email: user?.email ?? "",
    plan: profile?.plan ?? "free",
    // The app counts credit in cents.
    credits: Math.round(Number(profile?.credits_usd ?? 0) * 100),
    team: null,
    perks: [],
  });
}

export const OPTIONS = preflight;

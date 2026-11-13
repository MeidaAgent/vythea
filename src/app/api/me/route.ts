import { admin } from "@/lib/gateway/admin";
import { json, signedOut, teamsOf, whoIs } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { displayName } from "@/lib/account";

export const dynamic = "force-dynamic";

/** GET /me: who a token belongs to, and what they have. The app asks this to show the plan and credit. */
export async function GET(request: Request) {
  const who = await whoIs(request);
  if (!who) return signedOut();

  const db = admin();
  const [{ data: profile }, { data: found }, { data: rules }, { data: claim }] = await Promise.all([
    db.from("profiles").select("plan,plan_until,credits_usd,free_used").eq("id", who.userId).single(),
    db.auth.admin.getUserById(who.userId),
    db.from("settings").select("key,value").in("key", ["free_model", "free_requests"]),
    db.from("free_claims").select("user_id").eq("user_id", who.userId).maybeSingle(),
  ]);
  const user = found?.user;
  const teams = who.teamId ? await teamsOf(who.userId) : [];
  await db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", who.id);

  // The free model counts as free to the app while the account still has free requests left.
  const setting = new Map((rules ?? []).map((r) => [r.key as string, r.value as unknown]));
  const freeModel = typeof setting.get("free_model") === "string" ? (setting.get("free_model") as string) : "";
  const left = Math.max(0, Math.floor(Number(setting.get("free_requests") ?? 0)) - Number(profile?.free_used ?? 0));
  const perks =
    freeModel && left > 0 && claim
      ? [{ id: "free-requests", name: "Free requests", model: freeModel, share: 100, available: true, left_requests: left }]
      : [];

  return json({
    name: user ? displayName(user) : "Vythea user",
    email: user?.email ?? "",
    // A paid plan counts only while it is running; after that the account is Free again.
    plan:
      (profile?.plan === "pro" || profile?.plan === "team") &&
      profile.plan_until &&
      new Date(profile.plan_until as string) > new Date()
        ? profile.plan
        : "free",
    // The app counts credit in cents.
    credits: Math.round(Number(profile?.credits_usd ?? 0) * 100),
    // The team this computer bills to, if it picked one and is still a member.
    team: who.teamId ? (teams.find((t) => t.id === who.teamId) ?? null) : null,
    perks,
  });
}

export const OPTIONS = preflight;

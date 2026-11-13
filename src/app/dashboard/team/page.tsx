import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { TeamPanel, type Audit, type Member } from "@/components/account/TeamPanel";
import { requireUser } from "@/lib/account";
import { admin } from "@/lib/gateway/admin";

export const metadata: Metadata = { title: "Team" };

export default async function Page() {
  const me = await requireUser("/dashboard/team");
  if (!me) {
    return <Soon kicker="Team" title="Not available yet." text="Accounts aren't switched on for this site yet." />;
  }

  // Row-level security shows a person only their own team.
  const { data: team } = await me.supabase.from("teams").select("id,name,owner_id,credits_usd,seats,plan_until,created_at").maybeSingle();
  let members: Member[] = [];
  let audit: Audit[] = [];

  if (team) {
    const [rows, log] = await Promise.all([
      me.supabase.from("team_members").select("user_id,role,daily_limit_usd,joined_at").eq("team_id", team.id).order("joined_at"),
      me.supabase.from("team_audit").select("id,actor_id,action,detail,created_at").eq("team_id", team.id).order("created_at", { ascending: false }).limit(30),
    ]);
    // Names come from the server side: people can read their teammates' names, nothing else about them.
    const ids = [...new Set([...(rows.data ?? []).map((r) => r.user_id as string), ...(log.data ?? []).map((l) => l.actor_id as string | null).filter((v): v is string => !!v)])];
    const { data: names } = ids.length
      ? await admin().from("profiles").select("id,username").in("id", ids)
      : { data: [] as { id: string; username: string | null }[] };
    const nameOf = new Map((names ?? []).map((n) => [n.id as string, (n.username as string | null) ?? "Someone"]));
    members = (rows.data ?? []).map((r) => ({
      id: r.user_id as string,
      name: nameOf.get(r.user_id as string) ?? "Someone",
      role: r.role as "owner" | "member",
      limit: r.daily_limit_usd === null ? null : Number(r.daily_limit_usd),
      joined: r.joined_at as string,
    }));
    audit = (log.data ?? []).map((l) => ({
      id: l.id as number,
      who: l.actor_id ? (nameOf.get(l.actor_id as string) ?? "Someone") : "Someone",
      action: l.action as string,
      detail: (l.detail ?? {}) as Record<string, unknown>,
      at: l.created_at as string,
    }));
  }

  const { data: profile } = await me.supabase.from("profiles").select("credits_usd").eq("id", me.user.id).single();

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Team</p>
        <h1 className="dash-title">Team.</h1>
        <p className="dash-sub">Share one credit pool, set a daily limit for each person, and see what changed.</p>
      </div>
      <TeamPanel
        me={me.user.id}
        balance={Number(profile?.credits_usd ?? 0)}
        team={
          team
            ? {
                id: team.id as string,
                name: team.name as string,
                owner: team.owner_id as string,
                pool: Number(team.credits_usd),
                seats: Number(team.seats),
                until: team.plan_until && new Date(team.plan_until as string) > new Date() ? (team.plan_until as string) : null,
              }
            : null
        }
        members={members}
        audit={audit}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JoinCard } from "@/components/account/JoinCard";
import { admin } from "@/lib/gateway/admin";
import { createClient, hasSupabase } from "@/lib/supabase/server";
import "@/styles/account.css";

export const metadata: Metadata = { title: "Join a team" };

/** Where an invite link lands: sign in if needed, then see the team and accept. */
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const shell = (body: React.ReactNode) => (
    <div className="acct-wrap">
      <main id="main" className="acct-card">
        {body}
      </main>
    </div>
  );

  if (!hasSupabase || !/^vti-[0-9a-f]{48}$/.test(token)) {
    return shell(
      <>
        <h1>Join a team</h1>
        <p>This invite link isn&apos;t valid. Ask the team owner for a new one.</p>
      </>,
    );
  }

  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/team/join?token=${token}`)}`);

  const { data } = await admin().rpc("team_invite_peek", { p_token: token });
  const team = (data as { team_name: string }[] | null)?.[0]?.team_name;
  if (!team) {
    return shell(
      <>
        <h1>Join a team</h1>
        <p>This invite link has expired or was already used. Ask the team owner for a new one.</p>
      </>,
    );
  }
  return shell(<JoinCard token={token} team={team} />);
}

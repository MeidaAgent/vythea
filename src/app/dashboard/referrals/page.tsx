import type { Metadata } from "next";
import { CopyField } from "@/components/account/CopyField";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Referrals" };

export default async function ReferralsPage() {
  const me = await requireUser("/dashboard/referrals");
  if (!me) {
    return (
      <Soon
        kicker="Referrals"
        title="Not available yet."
        text="Accounts aren't switched on for this site yet."
      />
    );
  }

  const { data } = await me.supabase.rpc("referral_stats");
  const stats = (Array.isArray(data) ? data[0] : data) as { ref_code: string; signed_up: number } | undefined;
  const link = `${SITE.url}/login?ref=${stats?.ref_code ?? ""}`;

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Referrals</p>
        <h1 className="dash-title">Invite someone.</h1>
        <p className="dash-sub">
          Share your link. When someone creates an account with it, it is counted here.
        </p>
      </div>

      {stats ? (
        <>
          <section className="ov-panel ref-link">
            <header>
              <h2 className="micro">Your invite link</h2>
            </header>
            <CopyField value={link} label="Your invite link" />
          </section>

          <dl className="acct-stats">
            <div>
              <dt className="micro">Signed up</dt>
              <dd>{Number(stats.signed_up)}</dd>
            </div>
            <div>
              <dt className="micro">Reward</dt>
              <dd>Not set yet</dd>
            </div>
          </dl>

          <p className="acct-note">
            Rewards are not active yet. Every sign-up through your link is recorded, and the reward terms will
            be published here and on the Billing page before paid plans open.
          </p>
        </>
      ) : (
        <p className="acct-note">
          Your invite link isn&apos;t available right now. Please try again in a moment.
        </p>
      )}
    </div>
  );
}

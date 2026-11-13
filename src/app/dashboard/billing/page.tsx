import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { ClaimFree } from "@/components/account/ClaimFree";
import { TopUp } from "@/components/account/TopUp";
import { STAR_REPO, STAR_URL } from "@/lib/claim";
import { requireUser } from "@/lib/account";
import { admin } from "@/lib/gateway/admin";
import { fmtDateTime, fmtUsd } from "@/lib/format";

export const metadata: Metadata = { title: "Billing" };

type Entry = { id: number; amount_usd: number; reason: string; created_at: string };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ claim?: string }> }) {
  const { claim } = await searchParams;
  const me = await requireUser("/dashboard/billing");
  if (!me) {
    return (
      <Soon
        kicker="Billing"
        title="Not available yet."
        text="Accounts aren't switched on for this site yet."
      />
    );
  }

  const [profile, ledger, rules, claimRow] = await Promise.all([
    me.supabase.from("profiles").select("credits_usd,free_used").eq("id", me.user.id).single(),
    me.supabase
      .from("credit_ledger")
      .select("id,amount_usd,reason,created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    admin().from("settings").select("key,value").in("key", ["free_model", "free_requests"]),
    me.supabase.from("free_claims").select("github_login").eq("user_id", me.user.id).maybeSingle(),
  ]);
  const claimed = Boolean(claimRow.data);
  const balance = Number(profile.data?.credits_usd ?? 0);
  const setting = new Map((rules.data ?? []).map((r) => [r.key as string, r.value as unknown]));
  const freeTotal = Math.max(0, Math.floor(Number(setting.get("free_requests") ?? 0)));
  const freeLeft = Math.max(0, freeTotal - Number(profile.data?.free_used ?? 0));
  const entries = (ledger.data ?? []) as Entry[];

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Billing</p>
        <h1 className="dash-title">Credit.</h1>
        <p className="dash-sub">Hosted models draw from your credit, billed per request at the prices on the Models page.</p>
      </div>

      <dl className="acct-stats">
        <div>
          <dt className="micro">Balance</dt>
          <dd>{fmtUsd(balance)}</dd>
        </div>
        {freeTotal > 0 && claimed && (
          <div>
            <dt className="micro">Free requests left</dt>
            <dd>
              {freeLeft} of {freeTotal}
            </dd>
          </div>
        )}
        <div>
          <dt className="micro">Plan</dt>
          <dd>Free</dd>
        </div>
      </dl>

      {freeTotal > 0 && !claimed && (
        <ClaimFree total={freeTotal} repoUrl={STAR_URL} repoName={STAR_REPO} result={claim} />
      )}

      <TopUp />

      <h2 className="dash-h2">History</h2>
      {entries.length === 0 ? (
        <p className="acct-note">No credit movements yet.</p>
      ) : (
        <ul className="acct-list">
          {entries.map((e) => (
            <li key={e.id}>
              <div className="grow">
                <b>{e.reason}</b>
                <small>{fmtDateTime(e.created_at)}</small>
              </div>
              <span>
                {Number(e.amount_usd) > 0 ? "+" : ""}
                {fmtUsd(Number(e.amount_usd))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";
import { fmtNum, fmtUsd } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const me = await requireUser("/dashboard");
  if (!me) {
    return (
      <Soon
        kicker="Overview"
        title="Not available yet."
        text="Accounts aren't switched on for this site yet."
      />
    );
  }

  const [keys, profile, daily] = await Promise.all([
    me.supabase.from("api_keys").select("id", { count: "exact", head: true }).is("revoked_at", null),
    me.supabase.from("profiles").select("credits_usd").eq("id", me.user.id).single(),
    me.supabase.rpc("usage_daily", { p_days: 30 }),
  ]);
  const count = keys.count;
  const credit = Number(profile.data?.credits_usd ?? 0);
  const requests = ((daily.data ?? []) as { requests: number }[]).reduce((s, d) => s + Number(d.requests), 0);

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Overview</p>
        <h1 className="dash-title">Hello, {me.name}.</h1>
        <p className="dash-sub">Your account at a glance.</p>
      </div>

      <dl className="acct-stats">
        <div>
          <dt className="micro">API keys</dt>
          <dd>{count ?? 0}</dd>
        </div>
        <div>
          <dt className="micro">Requests, 30 days</dt>
          <dd>{fmtNum(requests)}</dd>
        </div>
        <div>
          <dt className="micro">Credit</dt>
          <dd>{fmtUsd(credit)}</dd>
        </div>
        <div>
          <dt className="micro">Gateway</dt>
          <dd>Not open yet</dd>
        </div>
        <div>
          <dt className="micro">Plan</dt>
          <dd>Free</dd>
        </div>
      </dl>

      <p className="acct-more">
        <Link href="/dashboard/keys" className="btn btn-line btn-xs">
          Manage API keys
        </Link>{" "}
        <Link href="/dashboard/download" className="btn btn-line btn-xs">
          Get the app
        </Link>
      </p>
    </div>
  );
}

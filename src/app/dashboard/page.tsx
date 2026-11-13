import type { Metadata } from "next";
import Link from "next/link";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

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

  const { count } = await me.supabase
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .is("revoked_at", null);

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

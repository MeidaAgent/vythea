import type { Metadata } from "next";
import Link from "next/link";
import { GetStarted } from "@/components/account/GetStarted";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";
import { fmtDay, fmtNum, fmtUsd } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

type Day = { day: string; requests: number; cost_usd: number };
type Top = { model: string; requests: number; cost_usd: number };
type Key = { id: string; name: string; prefix: string; last_used_at: string | null };

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

  const [keys, profile, daily, top] = await Promise.all([
    me.supabase
      .from("api_keys")
      .select("id,name,prefix,last_used_at", { count: "exact" })
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
    me.supabase.from("profiles").select("credits_usd").eq("id", me.user.id).single(),
    me.supabase.rpc("usage_daily", { p_days: 30 }),
    me.supabase.rpc("usage_top_models", { p_days: 30 }),
  ]);

  const keyCount = keys.count ?? 0;
  const keyList = (keys.data ?? []) as Key[];
  const credit = Number(profile.data?.credits_usd ?? 0);
  const days = ((daily.data ?? []) as Day[]).map((d) => ({
    day: d.day,
    requests: Number(d.requests),
    cost: Number(d.cost_usd),
  }));
  const topModels = ((top.data ?? []) as Top[]).map((t) => ({
    model: t.model,
    requests: Number(t.requests),
    cost: Number(t.cost_usd),
  }));

  const requests = days.reduce((s, d) => s + d.requests, 0);
  const spend = days.reduce((s, d) => s + d.cost, 0);
  const peak = Math.max(0, ...days.map((d) => d.cost));

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Overview</p>
        <h1 className="dash-title">Hello, {me.name}.</h1>
        <p className="dash-sub">Your credit, your keys and what you used in the last thirty days.</p>
      </div>

      <GetStarted
        steps={[
          {
            title: "Get the app",
            text: "Available for Windows, macOS and Linux. The app and the terminal come together.",
            href: "/dashboard/download",
            cta: "Download",
            done: false,
          },
          {
            title: "Create an API key",
            text: "A key lets the app and your own tools call models through Vythea.",
            href: "/dashboard/keys",
            cta: "API keys",
            done: keyCount > 0,
          },
          {
            title: "Send a first request",
            text: "Pick a model, copy its id and send a message with your key.",
            href: "/dashboard/models",
            cta: "Models",
            done: requests > 0,
          },
        ]}
      />

      <div className="ov-stats">
        <div className="ov-card">
          <p className="micro">[ 01 ] Credit</p>
          <strong>{fmtUsd(credit)}</strong>
          <small>For paid models</small>
          <Link href="/dashboard/billing" className="micro">
            Billing →
          </Link>
        </div>
        <div className="ov-card">
          <p className="micro">[ 02 ] Spent · 30 days</p>
          <strong>{fmtUsd(spend)}</strong>
          <small>Across all keys</small>
          <Link href="/dashboard/usage" className="micro">
            See usage →
          </Link>
        </div>
        <div className="ov-card">
          <p className="micro">[ 03 ] Requests · 30 days</p>
          <strong>{fmtNum(requests)}</strong>
          <small>
            Across {topModels.length} {topModels.length === 1 ? "model" : "models"}
          </small>
          <Link href="/dashboard/models" className="micro">
            Browse models →
          </Link>
        </div>
        <div className="ov-card">
          <p className="micro">[ 04 ] Plan</p>
          <strong>Free</strong>
          <small>Paid plans come later</small>
          <Link href="/dashboard/billing" className="micro">
            See billing →
          </Link>
        </div>
      </div>

      <div className="ov-two">
        <section className="ov-panel">
          <header>
            <h2 className="micro">Spend // last 30 days</h2>
            <span className="micro">Peak {fmtUsd(peak)}</span>
          </header>
          <div
            className="acct-bars ov-bars"
            role="img"
            aria-label={`Spend per day over the last 30 days: ${fmtUsd(spend)} in total.`}
          >
            {days.map((d) => (
              <span
                key={d.day}
                title={`${fmtDay(d.day)}: ${fmtUsd(d.cost)}`}
                className={d.cost ? "on" : undefined}
                style={{ height: `${Math.max(d.cost ? 6 : 2, peak ? (d.cost / peak) * 100 : 0)}%` }}
              />
            ))}
          </div>
          <p className="acct-axis">
            <span>{days[0] ? fmtDay(days[0].day) : ""}</span>
            <span>Today</span>
          </p>
        </section>

        <section className="ov-panel">
          <header>
            <h2 className="micro">Top models</h2>
            <Link href="/dashboard/usage" className="micro">
              All →
            </Link>
          </header>
          {topModels.length === 0 ? (
            <p className="ov-empty">Nothing yet. Send a request with one of your keys and it shows here.</p>
          ) : (
            <ul className="ov-list">
              {topModels.map((t) => (
                <li key={t.model}>
                  <code>{t.model}</code>
                  <span>
                    {fmtNum(t.requests)} · {fmtUsd(t.cost)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="ov-two">
        <section className="ov-panel">
          <header>
            <h2 className="micro">API keys // {keyCount}</h2>
            <Link href="/dashboard/keys" className="micro">
              Manage →
            </Link>
          </header>
          {keyList.length === 0 ? (
            <p className="ov-empty">No keys yet. Create one to start using Vythea from your own tools.</p>
          ) : (
            <ul className="ov-list">
              {keyList.map((k) => (
                <li key={k.id}>
                  <span>{k.name}</span>
                  <span>
                    <code>{k.prefix}…</code> ·{" "}
                    {k.last_used_at ? `used ${fmtDay(k.last_used_at)}` : "not used yet"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ov-panel">
          <header>
            <h2 className="micro">Shortcuts</h2>
          </header>
          <ul className="ov-links">
            <li>
              <Link href="/dashboard/keys">Create an API key →</Link>
            </li>
            <li>
              <Link href="/dashboard/models">Browse models →</Link>
            </li>
            <li>
              <Link href="/dashboard/referrals">Invite someone →</Link>
            </li>
            <li>
              <Link href="/docs">Read the guide →</Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

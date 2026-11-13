import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";
import { fmtDateTime, fmtDay, fmtNum, fmtUsd } from "@/lib/format";

export const metadata: Metadata = { title: "Usage" };

type Day = { day: string; requests: number; tokens: number; cost_usd: number };
type Event = {
  id: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  status: string;
  created_at: string;
  api_keys: { name: string } | null;
};

export default async function UsagePage() {
  const me = await requireUser("/dashboard/usage");
  if (!me) {
    return (
      <Soon kicker="Usage" title="Not available yet." text="Accounts aren't switched on for this site yet." />
    );
  }

  const [daily, recent] = await Promise.all([
    me.supabase.rpc("usage_daily", { p_days: 30 }),
    me.supabase
      .from("usage_events")
      .select("id,model,input_tokens,output_tokens,cost_usd,status,created_at,api_keys(name)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const days = ((daily.data ?? []) as Day[]).map((d) => ({
    ...d,
    requests: Number(d.requests),
    tokens: Number(d.tokens),
    cost_usd: Number(d.cost_usd),
  }));
  const events = (recent.data ?? []) as unknown as Event[];

  const requests = days.reduce((s, d) => s + d.requests, 0);
  const tokens = days.reduce((s, d) => s + d.tokens, 0);
  const spend = days.reduce((s, d) => s + d.cost_usd, 0);
  const peak = Math.max(1, ...days.map((d) => d.requests));

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Usage</p>
        <h1 className="dash-title">Last 30 days.</h1>
        <p className="dash-sub">Requests, tokens and spend across all of your keys.</p>
      </div>

      <dl className="acct-stats">
        <div>
          <dt className="micro">Requests</dt>
          <dd>{fmtNum(requests)}</dd>
        </div>
        <div>
          <dt className="micro">Tokens</dt>
          <dd>{fmtNum(tokens)}</dd>
        </div>
        <div>
          <dt className="micro">Spend</dt>
          <dd>{fmtUsd(spend)}</dd>
        </div>
      </dl>

      <div
        className="acct-bars"
        role="img"
        aria-label={`Requests per day for the last 30 days: ${requests} in total, busiest day ${peak > 1 || requests ? peak : 0}.`}
      >
        {days.map((d) => (
          <span
            key={d.day}
            title={`${fmtDay(d.day)}: ${d.requests} requests`}
            style={{ height: `${Math.max(d.requests ? 6 : 2, (d.requests / peak) * 100)}%` }}
            className={d.requests ? "on" : undefined}
          />
        ))}
      </div>
      <p className="acct-axis">
        <span>{days[0] ? fmtDay(days[0].day) : ""}</span>
        <span>Today</span>
      </p>

      {events.length === 0 ? (
        <p className="acct-note">
          No requests yet. They show up here as soon as a key of yours is used through the gateway.
        </p>
      ) : (
        <>
          <h2 className="dash-h2">Recent requests</h2>
          <div className="acct-scroll">
            <table className="acct-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Model</th>
                  <th>Key</th>
                  <th>Tokens in / out</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{fmtDateTime(e.created_at)}</td>
                    <td>{e.model}</td>
                    <td>{e.api_keys?.name ?? "Deleted key"}</td>
                    <td>
                      {fmtNum(e.input_tokens)} / {fmtNum(e.output_tokens)}
                    </td>
                    <td>{fmtUsd(Number(e.cost_usd))}</td>
                    <td>{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

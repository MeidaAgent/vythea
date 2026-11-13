"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyField } from "@/components/account/CopyField";
import { fmtUsd } from "@/lib/format";

export type Member = { id: string; name: string; role: "owner" | "member"; limit: number | null; joined: string };
export type Audit = { id: number; who: string; action: string; detail: Record<string, unknown>; at: string };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const SAYS: Record<string, (d: Record<string, unknown>) => string> = {
  "team.created": (d) => `created the team ${String(d.name ?? "")}`.trim(),
  "credit.added": (d) => `added ${fmtUsd(Number(d.usd ?? 0))} to the team`,
  "credit.withdrawn": (d) => `took ${fmtUsd(Number(d.usd ?? 0))} back from the team`,
  "invite.created": () => "created an invite link",
  "member.joined": () => "joined the team",
  "member.left": () => "left the team",
  "member.removed": () => "removed a member",
  "plan.bought": (d) => `bought the Team plan: ${String(d.seats ?? "")} seats for 1 ${String(d.period ?? "")}, ${fmtUsd(Number(d.usd ?? 0))}`,
  "member.limit": (d) => (d.daily_limit_usd == null ? "removed a member's daily limit" : `set a member's daily limit to ${fmtUsd(Number(d.daily_limit_usd))}`),
};

/** The team: create one, invite people, share credit, set limits, and see what happened. */
export function TeamPanel({
  me,
  balance,
  team,
  members,
  audit,
}: {
  me: string;
  balance: number;
  team: { id: string; name: string; owner: string; pool: number; seats: number; until: string | null } | null;
  members: Member[];
  audit: Audit[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [seats, setSeats] = useState(team?.seats ?? 2);
  const [period, setPeriod] = useState<"month" | "year">("month");
  const [buying, setBuying] = useState(false);
  const isOwner = team?.owner === me;
  const cap = team?.until ? team.seats : 2;
  const price = (seats * (period === "year" ? 183.6 : 18)).toFixed(2);

  const call = async (body: Record<string, unknown>, okText?: string) => {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    setBusy(false);
    if (!res.ok) {
      setMessage({ ok: false, text: String(data.error ?? "Please try again.") });
      return null;
    }
    if (okText) setMessage({ ok: true, text: okText });
    router.refresh();
    return data;
  };

  if (!team) {
    return (
      <section className="topup" aria-label="Create a team">
        <h2 className="dash-h2">Create a team</h2>
        <p className="acct-note">
          A team shares one credit pool. You add credit to it from your own balance, invite people with a link, and
          set a daily limit for each. A team can have two people; the Team plan raises that to five. You can be in
          one team at a time.
        </p>
        <div className="cf">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" aria-label="Team name" maxLength={60} />
          <button type="button" className="btn btn-fill btn-xs" disabled={busy || name.trim().length < 2} onClick={() => call({ action: "create", name })}>
            {busy ? "Creating…" : "Create team"}
          </button>
        </div>
        {message && <p className={message.ok ? "acct-note" : "lg-hint"} role="status">{message.text}</p>}
      </section>
    );
  }

  return (
    <>
      <dl className="acct-stats">
        <div>
          <dt className="micro">Team</dt>
          <dd>{team.name}</dd>
        </div>
        <div>
          <dt className="micro">Team credit</dt>
          <dd>{fmtUsd(team.pool)}</dd>
        </div>
        <div>
          <dt className="micro">Members</dt>
          <dd>{members.length} of {cap}</dd>
        </div>
        <div>
          <dt className="micro">Plan</dt>
          <dd>{team.until ? "Team" : "No plan"}</dd>
        </div>
      </dl>

      <section className="topup" aria-label="Team plan">
        <h2 className="dash-h2">Team plan</h2>
        <p className="acct-note">
          {team.until
            ? `Team plan for ${team.seats} seats until ${new Date(team.until).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}. Requests billed to the team get three times the requests a minute and a 10% markup instead of 20%. Buying again adds time to the end.`
            : "Without a plan a team can have two people. The Team plan gives you 2 to 5 seats, three times the requests a minute and a 10% markup instead of 20% on hosted models, paid from the team's credit."}
        </p>
        {isOwner &&
          (buying ? (
            <>
              <p className="acct-note">
                {seats} seats for 1 {period}: <b>${price}</b> is taken from the team&apos;s credit ({fmtUsd(team.pool)}). It isn&apos;t refundable.
              </p>
              <p className="acct-more">
                <button type="button" className="btn btn-fill btn-xs" disabled={busy} onClick={async () => { if (await call({ action: "plan", seats, period }, "The Team plan is active.")) setBuying(false); }}>
                  {busy ? "Buying…" : `Buy for $${price}`}
                </button>{" "}
                <button type="button" className="btn btn-line btn-xs" disabled={busy} onClick={() => setBuying(false)}>Cancel</button>
              </p>
            </>
          ) : (
            <div className="topup-row" role="group" aria-label="Plan options">
              {[2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className={`btn btn-xs ${seats === n ? "btn-fill" : "btn-line"}`} aria-pressed={seats === n} disabled={n < members.length} onClick={() => setSeats(n)}>
                  {n} seats
                </button>
              ))}
              <button type="button" className={`btn btn-xs ${period === "month" ? "btn-fill" : "btn-line"}`} aria-pressed={period === "month"} onClick={() => setPeriod("month")}>Monthly</button>
              <button type="button" className={`btn btn-xs ${period === "year" ? "btn-fill" : "btn-line"}`} aria-pressed={period === "year"} onClick={() => setPeriod("year")}>Yearly</button>
              <button type="button" className="btn btn-fill btn-xs" onClick={() => setBuying(true)}>
                {team.until ? "Add time" : "Get Team"} · ${price}
              </button>
            </div>
          ))}
      </section>

      {isOwner && (
        <section className="topup" aria-label="Team credit">
          <h2 className="dash-h2">Team credit</h2>
          <p className="acct-note">
            Move credit between your balance ({fmtUsd(balance)}) and the team. Use a negative amount to take it back.
          </p>
          <div className="cf">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in dollars, e.g. 10" inputMode="decimal" aria-label="Amount in dollars" />
            <button type="button" className="btn btn-fill btn-xs" disabled={busy || !amount.trim()} onClick={async () => { if (await call({ action: "credit", amount: Number(amount) }, "Done.")) setAmount(""); }}>
              {busy ? "Moving…" : "Move credit"}
            </button>
          </div>
        </section>
      )}

      <h2 className="dash-h2">Members</h2>
      <ul className="acct-list">
        {members.map((m) => (
          <li key={m.id}>
            <div className="grow">
              <b>{m.name}{m.id === me ? " (you)" : ""}</b>
              <small>
                {m.role === "owner" ? "Owner" : "Member"} · joined {when(m.joined)} · daily limit {m.limit === null ? "none" : fmtUsd(m.limit)}
              </small>
            </div>
            {isOwner && m.role !== "owner" && (
              <span>
                <button type="button" className="btn btn-line btn-xs" disabled={busy} onClick={() => {
                  const v = window.prompt("Daily limit in dollars (leave empty for none):", m.limit === null ? "" : String(m.limit));
                  if (v !== null) void call({ action: "limit", member: m.id, limit: v.trim() === "" ? null : Number(v) }, "Limit saved.");
                }}>
                  Set limit
                </button>{" "}
                {confirming === m.id ? (
                  <>
                    <button type="button" className="btn btn-fill btn-xs" disabled={busy} onClick={async () => { setConfirming(null); await call({ action: "remove", member: m.id }); }}>
                      Remove
                    </button>{" "}
                    <button type="button" className="btn btn-line btn-xs" onClick={() => setConfirming(null)}>Keep</button>
                  </>
                ) : (
                  <button type="button" className="btn btn-line btn-xs" onClick={() => setConfirming(m.id)}>Remove</button>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <section className="topup" aria-label="Invite">
          <h2 className="dash-h2">Invite someone</h2>
          <p className="acct-note">Create a link and send it to them. It works once and expires in 7 days.</p>
          {link ? (
            <CopyField value={link} label="Invite link" />
          ) : (
            <p className="acct-more">
              <button type="button" className="btn btn-fill btn-xs" disabled={busy || members.length >= cap} onClick={async () => { const d = await call({ action: "invite" }); if (d && typeof d.link === "string") setLink(d.link); }}>
                {busy ? "Creating…" : "Create invite link"}
              </button>
            </p>
          )}
        </section>
      ) : (
        <p className="acct-more">
          <button type="button" className="btn btn-line btn-xs" disabled={busy} onClick={() => call({ action: "leave" })}>
            Leave team
          </button>
        </p>
      )}

      {message && <p className={message.ok ? "acct-note" : "lg-hint"} role="status">{message.text}</p>}

      <h2 className="dash-h2">Activity</h2>
      {audit.length === 0 ? (
        <p className="acct-note">Nothing has happened yet.</p>
      ) : (
        <ul className="acct-list">
          {audit.map((a) => (
            <li key={a.id}>
              <div className="grow">
                <b>{a.who} {(SAYS[a.action] ?? (() => a.action))(a.detail)}</b>
                <small>{when(a.at)}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Period = "month" | "year";

const PRICE: Record<Period, { usd: number; per: string }> = {
  month: { usd: 20, per: "month" },
  year: { usd: 199.2, per: "year" },
};

const day = (iso: string) => new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

/** The plan: what it is now, and buying Pro from credit with a clear confirmation first. */
export function Plans({ plan, until, balance }: { plan: "free" | "pro"; until: string | null; balance: number }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<Period | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const buy = async (period: Period) => {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/billing/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "pro", period }),
    });
    const data = (await res.json().catch(() => ({}))) as { until?: string; error?: string };
    setBusy(false);
    setConfirm(null);
    if (!res.ok) return setMessage({ ok: false, text: data.error ?? "Please try again." });
    setMessage({ ok: true, text: `Pro is active until ${day(data.until ?? "")}.` });
    router.refresh();
  };

  return (
    <section className="topup" id="plans" aria-label="Plan">
      <h2 className="dash-h2">Plan</h2>
      <p className="acct-note">
        {plan === "pro" && until
          ? `You're on Pro until ${day(until)}. Buying again adds time to the end.`
          : "You pay as you go. Pro lifts your request limit three times and lowers the markup on hosted models from 20% to 10%, paid from your credit."}
      </p>
      {confirm ? (
        <>
          <p className="acct-note">
            Buy Pro for 1 {PRICE[confirm].per}: <b>${PRICE[confirm].usd}</b> is taken from your credit (you have $
            {balance.toFixed(2)}). It isn&apos;t refundable.
          </p>
          <p className="acct-more">
            <button type="button" className="btn btn-fill btn-xs" disabled={busy} onClick={() => buy(confirm)}>
              {busy ? "Buying…" : `Buy Pro for $${PRICE[confirm].usd}`}
            </button>{" "}
            <button type="button" className="btn btn-line btn-xs" disabled={busy} onClick={() => setConfirm(null)}>
              Cancel
            </button>
          </p>
        </>
      ) : (
        <p className="acct-more">
          <button type="button" className="btn btn-fill btn-xs" onClick={() => setConfirm("month")}>
            {plan === "pro" ? "Add a month" : "Get Pro"} · $20 / month
          </button>{" "}
          <button type="button" className="btn btn-line btn-xs" onClick={() => setConfirm("year")}>
            {plan === "pro" ? "Add a year" : "Yearly"} · $199.20 / year
          </button>
        </p>
      )}
      {message && (
        <p className={message.ok ? "acct-note" : "lg-hint"} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}

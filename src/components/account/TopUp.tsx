"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyField } from "@/components/account/CopyField";

type Invoice = { id: string; chain: "base" | "bsc"; network: string; tokens: string[]; address: string; amount: string; expires: string };

const NETWORKS = [
  { id: "base", label: "Base", note: "USDC" },
  { id: "bsc", label: "BNB Chain", note: "USDT or USDC" },
] as const;
const AMOUNTS = [5, 10, 25, 50];

/** Adding credit with stablecoins: ask for an exact amount to send, then paste the transaction hash. */
export function TopUp() {
  const router = useRouter();
  const [chain, setChain] = useState<"base" | "bsc">("base");
  const [amount, setAmount] = useState(10);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [tx, setTx] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: res.ok, data: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  };

  const start = async () => {
    setBusy(true);
    setMessage(null);
    const { ok, data } = await post("/api/billing/crypto/invoice", { chain, amount });
    setBusy(false);
    if (!ok) return setMessage({ ok: false, text: String(data.error ?? "Please try again.") });
    setInvoice(data as unknown as Invoice);
    setTx("");
  };

  const verify = async () => {
    if (!invoice) return;
    setBusy(true);
    setMessage(null);
    const { ok, data } = await post("/api/billing/crypto/verify", { chain: invoice.chain, tx });
    setBusy(false);
    if (ok && typeof data.credited === "number") {
      setMessage({ ok: true, text: `Added $${data.credited.toFixed(2)} of credit.` });
      setInvoice(null);
      router.refresh();
      return;
    }
    setMessage({ ok: false, text: String(data.error ?? "Please try again.") });
  };

  return (
    <section className="topup" aria-label="Add credit">
      <h2 className="dash-h2">Add credit</h2>
      {!invoice ? (
        <>
          <p className="acct-note">
            Pay with USDT or USDC. Credit is added when the payment is confirmed on the network. Minimum $5.
          </p>
          <div className="topup-row" role="group" aria-label="Network">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`btn btn-xs ${chain === n.id ? "btn-fill" : "btn-line"}`}
                aria-pressed={chain === n.id}
                onClick={() => setChain(n.id)}
              >
                {n.label} · {n.note}
              </button>
            ))}
          </div>
          <div className="topup-row" role="group" aria-label="Amount in US dollars">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                className={`btn btn-xs ${amount === a ? "btn-fill" : "btn-line"}`}
                aria-pressed={amount === a}
                onClick={() => setAmount(a)}
              >
                ${a}
              </button>
            ))}
          </div>
          <p className="acct-more">
            <button type="button" className="btn btn-fill btn-xs" disabled={busy} onClick={start}>
              {busy ? "Working…" : "Continue"}
            </button>
          </p>
        </>
      ) : (
        <>
          <p className="acct-note">
            Send <b>exactly {invoice.amount}</b> {invoice.tokens.join(" or ")} on <b>{invoice.network}</b> to the
            address below. The exact amount is how we know the payment is yours, and other networks or amounts
            can&apos;t be matched. The request stays open for 48 hours.
          </p>
          <CopyField value={invoice.address} label="Receiving address" action="Copy address" />
          <CopyField value={invoice.amount} label="Exact amount" action="Copy amount" />
          <p className="acct-note">When it is sent, paste the transaction hash here.</p>
          <div className="cf">
            <input
              value={tx}
              onChange={(e) => setTx(e.target.value)}
              placeholder="0x…"
              aria-label="Transaction hash"
              spellCheck={false}
            />
            <button type="button" className="btn btn-fill btn-xs" disabled={busy || !tx.trim()} onClick={verify}>
              {busy ? "Checking…" : "Check payment"}
            </button>
          </div>
          <p className="acct-more">
            <button type="button" className="btn btn-line btn-xs" onClick={() => setInvoice(null)}>
              Start over
            </button>
          </p>
        </>
      )}
      {message && (
        <p className={message.ok ? "acct-note" : "lg-hint"} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}

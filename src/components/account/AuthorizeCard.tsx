"use client";

import { useState } from "react";

/** The question a person answers before a computer is signed in: allow it, or not. */
export function AuthorizeCard({
  callback,
  state,
  client,
  name,
}: {
  callback: string;
  state: string;
  client: "cli" | "app";
  name: string;
}) {
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const ask = async (mode: "token" | "code") => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/devices/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, callback, client, mode }),
    });
    const data = (await res.json().catch(() => ({}))) as { redirect?: string; code?: string; error?: string };
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Please try again.");
    if (data.code) return setCode(data.code);
    if (data.redirect) {
      setDone(true);
      location.assign(data.redirect);
    }
  };

  const what = client === "cli" ? "the Vythea terminal" : "the Vythea app";

  if (done) {
    return (
      <>
        <h1>Signing in…</h1>
        <p>You can close this tab and go back to Vythea.</p>
      </>
    );
  }

  if (code) {
    return (
      <>
        <h1>Your code</h1>
        <p>
          In {what}, choose to sign in with a code and type this. It works once, for ten minutes.
        </p>
        <p>
          <strong style={{ fontSize: 28, letterSpacing: "0.12em" }}>{code}</strong>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Sign in to Vythea</h1>
      <p>
        Allow {what} on this computer to use your account, <b>{name}</b>? It can use your credit for hosted
        models. You can sign it out any time on the Devices page.
      </p>
      <p className="acct-more">
        <button type="button" className="btn btn-fill btn-xs" disabled={busy} onClick={() => ask("token")}>
          {busy ? "Working…" : "Allow"}
        </button>{" "}
        <button type="button" className="btn btn-line btn-xs" disabled={busy} onClick={() => ask("code")}>
          Use a code instead
        </button>
      </p>
      {error && (
        <p className="lg-hint" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

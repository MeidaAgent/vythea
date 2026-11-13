"use client";

import { useState } from "react";

/** Accepting a team invite. */
export function JoinCard({ token, team }: { token: string; team: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const join = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", token }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      location.assign("/dashboard/team");
      return;
    }
    setBusy(false);
    setError(data.error ?? "Please try again.");
  };

  return (
    <>
      <h1>Join {team}</h1>
      <p>
        You&apos;ve been invited to <b>{team}</b>. Joining lets the team owner see your name and set a daily limit
        for you, and requests you bill to the team come out of its shared credit.
      </p>
      <p className="acct-more">
        <button type="button" className="btn btn-fill btn-xs" disabled={busy} onClick={join}>
          {busy ? "Joining…" : "Join team"}
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

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MESSAGE: Record<string, { ok: boolean; text: string }> = {
  ok: { ok: true, text: "Done. Your free requests are unlocked." },
  nostar: { ok: false, text: "We couldn't see a star from that GitHub account yet. Star the repository, then check again." },
  young: { ok: false, text: "That GitHub account is too new to claim. Try again in a few days." },
  taken: { ok: false, text: "That GitHub account has already unlocked the free requests on another Vythea account." },
  failed: { ok: false, text: "Couldn't check GitHub just now. Try again in a moment." },
};

/** Unlocking the free requests: star the repository, then check it with GitHub. */
export function ClaimFree({
  total,
  repoUrl,
  repoName,
  result,
}: {
  total: number;
  repoUrl: string;
  repoName: string;
  result?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const note = result ? MESSAGE[result] : undefined;

  const verify = async () => {
    setBusy(true);
    setError("");
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard/billing&claim=1` },
    });
    if (err) {
      setBusy(false);
      setError("Couldn't reach GitHub. Try again.");
    }
  };

  return (
    <section className="topup" aria-label="Free requests">
      <h2 className="dash-h2">Free requests</h2>
      <p className="acct-note">
        Get {total} free requests on DeepSeek V4 Flash: star <b>{repoName}</b> on GitHub, then check it here. One
        GitHub account can unlock them once.
      </p>
      <p className="acct-more">
        <a className="btn btn-line btn-xs" href={repoUrl} target="_blank" rel="noopener noreferrer">
          Star on GitHub
        </a>{" "}
        <button type="button" className="btn btn-fill btn-xs" disabled={busy} onClick={verify}>
          {busy ? "Opening GitHub…" : "I've starred it, check"}
        </button>
      </p>
      {note && (
        <p className={note.ok ? "acct-note" : "lg-hint"} role="status">
          {note.text}
        </p>
      )}
      {error && (
        <p className="lg-hint" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

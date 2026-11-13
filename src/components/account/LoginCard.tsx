"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { createClient } from "@/lib/supabase/client";

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function LoginCard({ next, failed }: { next: string; failed: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(failed ? "Sign-in didn't finish. Try again." : "");

  const signIn = async () => {
    setBusy(true);
    setError("");
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (err) {
      setError("Couldn't reach GitHub. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="acct-wrap">
      <main id="main" className="acct-card">
        <Link href="/" aria-label="Vythea home">
          <Wordmark />
        </Link>
        <h1>Sign in</h1>
        <p>Use your GitHub account to manage API keys. No separate password to remember.</p>
        <button type="button" className="btn btn-ink" onClick={signIn} disabled={busy}>
          <GitHubMark />
          {busy ? "Opening GitHub…" : "Continue with GitHub"}
        </button>
        {error && (
          <p className="acct-error" role="alert">
            {error}
          </p>
        )}
        <p className="acct-fine">
          We only read your GitHub name and avatar. <Link href="/">Back to the site</Link>
        </p>
      </main>
    </div>
  );
}

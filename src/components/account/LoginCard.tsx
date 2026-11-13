"use client";

import { useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { InkCanvas } from "@/components/home/InkCanvas";
import { createClient } from "@/lib/supabase/client";

type Provider = "github" | "google";

// Which sign-in methods are switched on. Add "google" here (via NEXT_PUBLIC_AUTH_PROVIDERS) only
// after Google is enabled in Supabase; a button that can't work is worse than no button.
const ENABLED = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "github")
  .split(",")
  .map((p) => p.trim())
  .filter((p): p is Provider => p === "github" || p === "google");

const LABEL: Record<Provider, string> = { github: "GitHub", google: "Google" };

// The mascot stands between the heading and the card on wide screens and fades behind everything on phones.
const placeArt = (w: number) => (w > 860 ? { edge: 0.74, width: 0.48 } : { edge: 0.98, width: 0.95 });

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5Z"
      />
      <path fill="#FBBC05" d="M10.5 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.1a24 24 0 0 0 0 21.4l7.9-6.1Z" />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48Z"
      />
    </svg>
  );
}

export function LoginCard({ next, failed }: { next: string; failed: boolean }) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState(failed ? "Sign-in didn't finish. Please try again." : "");

  const signIn = async (provider: Provider) => {
    setBusy(provider);
    setError("");
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (err) {
      setError(`Couldn't reach ${LABEL[provider]}. Please try again.`);
      setBusy(null);
    }
  };

  const many = ENABLED.length > 1;

  return (
    <div className="lg-wrap">
      <InkCanvas place={placeArt} flip scatterOnScroll={false} />
      <Link href="/" className="lg-brand" aria-label="Vythea home">
        <Wordmark />
      </Link>

      <main id="main" className="lg-main">
        <div className="lg-copy">
          <p className="micro">Sign in</p>
          <h1>
            Welcome
            <br />
            back.
          </h1>
          <p>Your keys, usage and devices, in one account.</p>
        </div>

        <div className="lg-card">
          <div className="lg-body">
            <h2>Sign in to Vythea</h2>
            <p>Welcome back! Please sign in to continue</p>

            {error && (
              <p className="lg-err" role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}

            <div className="lg-providers" style={{ "--n": many ? ENABLED.length : 1 } as React.CSSProperties}>
              {ENABLED.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="lg-p"
                  onClick={() => signIn(p)}
                  disabled={busy !== null}
                  aria-label={`Continue with ${LABEL[p]}`}
                >
                  {p === "github" ? <GitHubMark /> : <GoogleMark />}
                  {!many && <span>{busy === p ? "Opening…" : `Continue with ${LABEL[p]}`}</span>}
                </button>
              ))}
            </div>
          </div>
          <p className="lg-foot">
            New here? Signing in creates your account. <Link href="/">Back to the site</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

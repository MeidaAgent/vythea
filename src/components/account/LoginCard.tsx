"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, TriangleAlert, Wallet } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Turnstile } from "@/components/account/Turnstile";
import { InkCanvas } from "@/components/home/InkCanvas";
import { createClient } from "@/lib/supabase/client";

type Method = "github" | "google" | "wallet" | "email";
type Social = "github" | "google";

// Which sign-in methods are shown. Each one also has to be switched on in Supabase
// (Authentication > Sign In / Providers); set NEXT_PUBLIC_AUTH_PROVIDERS to change the list.
const ENABLED = new Set(
  (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "github,wallet,email").split(",").map((p) => p.trim()),
);
const has = (m: Method) => ENABLED.has(m);

const LABEL: Record<Social, string> = { github: "GitHub", google: "Google" };

// Layout numbers shared with account.css: the heading's size, the card's width and the page gutter.
const clamp = (min: number, v: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * On wide screens the mascot gets exactly the gap between the heading and the card, so it never
 * touches either. Below 1100px the page stacks and she fades in behind everything.
 */
const placeArt = (w: number) => {
  if (w <= 1100) return { edge: 0.98, width: 0.95 };
  const gutter = clamp(18, w * 0.032, 52);
  const heading = clamp(48, w * 0.06, 88);
  const textRight = gutter + Math.max(heading * 4.1, 320) + 24; // "ACCOUNT" is about 4.1 times the font size wide; the paragraph is 320px
  const cardLeft = w - gutter - 420;
  const edge = cardLeft - 16;
  return { edge: edge / w, width: Math.max(edge - textRight, 200) / w };
};

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

const REF_COOKIE = "vy_ref";

export function LoginCard({
  next,
  failed,
  signup,
  refCode,
}: {
  next: string;
  failed: boolean;
  /** Arrived to register (an invite link or ?mode=signup): the wording says "create" instead of "sign in". */
  signup: boolean;
  /** The invite code from the link, already checked; "" when there is none. */
  refCode: string;
}) {
  const [busy, setBusy] = useState<Method | null>(null);

  // Remember the invite for the half hour it takes to finish signing up, wherever the sign-in goes.
  useEffect(() => {
    if (refCode) document.cookie = `${REF_COOKIE}=${refCode}; max-age=1800; path=/; samesite=lax`;
  }, [refCode]);
  const [error, setError] = useState(failed ? "Sign-in didn't finish. Please try again." : "");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  // The human check: a one-use token that email and wallet sign-in must carry.
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [captchaBad, setCaptchaBad] = useState(false);

  const onToken = useCallback((token: string | null) => {
    setCaptcha(token);
    if (token) setCaptchaBad(false);
  }, []);
  const onCaptchaFail = useCallback(() => setCaptchaBad(true), []);
  /** A token works once; after each attempt, win or lose, ask for another. */
  const spendCaptcha = () => {
    setCaptcha(null);
    setCaptchaReset((n) => n + 1);
  };

  const back = () => `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const social = async (provider: Social) => {
    setBusy(provider);
    setError("");
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: back() },
    });
    if (err) {
      setError(`Couldn't reach ${LABEL[provider]}. Please try again.`);
      setBusy(null);
    }
  };

  const wallet = async () => {
    setError("");
    if (!(window as unknown as { ethereum?: unknown }).ethereum) {
      setError("No wallet found. Install MetaMask, or open this page inside your wallet's browser.");
      return;
    }
    if (!captcha) {
      setError("The security check isn't finished yet. Please wait a moment and try again.");
      return;
    }
    setBusy("wallet");
    const { error: err } = await createClient().auth.signInWithWeb3({
      chain: "ethereum",
      statement: "Sign in to Vythea. Signing is free and moves no funds.",
      options: { captchaToken: captcha },
    });
    spendCaptcha();
    if (err) {
      setError(
        /disabled|not enabled|not allowed|provider/i.test(err.message)
          ? "Wallet sign-in isn't switched on yet."
          : "The wallet request was cancelled or failed. Please try again.",
      );
      setBusy(null);
      return;
    }
    // The wallet flow doesn't pass through /auth/callback, so credit the invite here.
    const invite = document.cookie.match(new RegExp(`${REF_COOKIE}=([a-z0-9]+)`))?.[1];
    if (invite) {
      await createClient().rpc("claim_referral", { p_code: invite });
      document.cookie = `${REF_COOKIE}=; max-age=0; path=/`;
    }
    location.assign(next);
  };

  const mail = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address || busy || !captcha) return;
    setBusy("email");
    setError("");
    const { error: err } = await createClient().auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: back(), shouldCreateUser: true, captchaToken: captcha },
    });
    spendCaptcha();
    setBusy(null);
    if (err) {
      setError(
        err.status === 429
          ? "Too many requests. Wait a minute and try again."
          : "Couldn't send the email. Check the address and try again.",
      );
      return;
    }
    setSentTo(address);
  };

  const socials = (["github", "google"] as const).filter(has);

  return (
    <div className="lg-wrap">
      <InkCanvas place={placeArt} flip scatterOnScroll={false} />
      <Link href="/" className="lg-brand" aria-label="Vythea home">
        <Wordmark />
      </Link>

      <main id="main" className="lg-main">
        <div className="lg-copy">
          <p className="micro">
            Vythea {"//"} {signup ? "Create account" : "Sign in"}
          </p>
          <h1>
            Account
            <br />
            access.
          </h1>
          <p>Manage your API keys, usage and devices from a single account.</p>
        </div>

        <div className="lg-card">
          <div className="lg-body">
            <p className="lg-kicker">{"// Account"}</p>
            <h2>{signup ? "Create your account" : "Sign in to Vythea"}</h2>
            <p className="lg-sub">
              {signup
                ? "Choose how you want to register. It takes a few seconds and needs no password."
                : "Choose a method to continue."}
            </p>

            {error && (
              <p className="lg-err" role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}

            {sentTo ? (
              <div className="lg-sent" role="status">
                <Mail size={20} aria-hidden="true" />
                <div>
                  <b>Check your inbox</b>
                  <p>
                    We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to continue.
                  </p>
                </div>
                <button type="button" className="btn btn-hollow btn-xs" onClick={() => setSentTo("")}>
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <div className="lg-stack">
                  {socials.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="btn btn-hollow lg-wide"
                      onClick={() => social(p)}
                      disabled={busy !== null}
                    >
                      {p === "github" ? <GitHubMark /> : <GoogleMark />}
                      {busy === p ? "Opening…" : `Continue with ${LABEL[p]}`}
                    </button>
                  ))}
                  {has("wallet") && (
                    <button
                      type="button"
                      className="btn btn-hollow lg-wide"
                      onClick={wallet}
                      disabled={busy !== null}
                    >
                      <Wallet aria-hidden="true" />
                      {busy === "wallet" ? "Waiting for wallet…" : "Continue with wallet"}
                    </button>
                  )}
                </div>

                {has("email") && (
                  <>
                    <p className="lg-or">or</p>
                    <form className="lg-field" onSubmit={mail}>
                      <label htmlFor="lg-email" className="micro">
                        Email address
                      </label>
                      <input
                        id="lg-email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="btn btn-fill lg-wide"
                        disabled={busy !== null || !email.trim() || !captcha}
                      >
                        {busy === "email" ? "Sending…" : captcha ? "Send sign-in link" : "Verifying…"}
                      </button>
                    </form>
                  </>
                )}

                {(has("email") || has("wallet")) && (
                  <>
                    <Turnstile onToken={onToken} onFail={onCaptchaFail} resetKey={captchaReset} />
                    {captchaBad && (
                      <p className="lg-hint" role="status">
                        The security check couldn&apos;t load. Turn off content blockers for this page and
                        reload.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          <p className="lg-foot">
            {signup ? (
              <>
                Already have an account? <Link href="/login">Sign in</Link>
              </>
            ) : (
              <>
                New to Vythea? <Link href="/login?mode=signup">Create an account</Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}

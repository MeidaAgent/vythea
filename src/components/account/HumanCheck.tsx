"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Turnstile } from "./Turnstile";

/** How long a check may run before we call it failed and offer another go. */
const GIVE_UP_MS = 30_000;

/**
 * The human check on the sign-in card: Cloudflare's own Turnstile widget, shown as Cloudflare makes it.
 * It hands the parent a one-use token (or null); change `resetKey` after using one to get the next.
 * If the check fails or never finishes, a short message and "Try again" start it over.
 */
export function HumanCheck({
  onToken,
  resetKey,
}: {
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [retries, setRetries] = useState(0);

  // A token belongs to the round it was issued in; a new round (after use, or after "Try again") starts clean.
  const round = resetKey + retries;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setDone(false);
    setFailed(false);
  }, [round]);

  const handleToken = useCallback(
    (token: string | null) => {
      setDone(!!token);
      if (token) setFailed(false);
      onToken(token);
    },
    [onToken],
  );
  const handleFail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    if (done || failed) return;
    const id = setTimeout(() => setFailed(true), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, [done, failed, round]);

  return (
    <div className="hc">
      <Turnstile onToken={handleToken} onFail={handleFail} resetKey={round} />
      {failed && !done && (
        <div className="hc-fail" role="alert">
          <span>Couldn&apos;t verify. Check your connection and try again.</span>
          <button
            type="button"
            className="btn btn-hollow btn-xs"
            onClick={() => {
              setFailed(false);
              setRetries((n) => n + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

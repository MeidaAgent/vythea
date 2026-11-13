"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { drawHalo, loadDots, type CheckStatus, type Frame } from "./halo";
import { Turnstile } from "./Turnstile";

const LABEL: Record<CheckStatus, string> = {
  idle: "Getting ready…",
  verifying: "Verifying you're human…",
  success: "Verified",
  error: "Couldn't verify.",
};

/** How long a check may run before we call it failed and offer another go. */
const GIVE_UP_MS = 30_000;

const WIDTH = 120;
const HEIGHT = 104;

/** The halo drawing: redrawn every frame, in the colour of the current status. */
function Halo({ status }: { status: CheckStatus }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef(status);

  useEffect(() => {
    live.current = status;
  }, [status]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = WIDTH * dpr;
    cv.height = HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const memory: Record<string, number> = {};
    let dots: Frame["dots"] = [];
    let last = performance.now() / 1000;
    let raf = 0;
    let dead = false;
    loadDots().then((d) => (dots = d));

    const tick = () => {
      if (dead) return;
      const t = performance.now() / 1000;
      const dt = Math.min(0.05, t - last);
      last = t;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      drawHalo(ctx, WIDTH, HEIGHT, { t, dt, status: live.current, still, dots, s: memory });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} style={{ width: WIDTH, height: HEIGHT }} aria-hidden="true" />;
}

/**
 * The human check as the sign-in card shows it: Cloudflare Turnstile does the real verifying out of
 * sight, and the halo shows how it is going. If it fails, "Try again" starts it over.
 * It hands the parent a one-use token (or null); change `resetKey` after using one to get the next.
 */
export function HumanCheck({
  onToken,
  resetKey,
}: {
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retries, setRetries] = useState(0);
  const [got, setGot] = useState<{ token: string; key: number } | null>(null);

  // A token belongs to the round it was issued in; a new round (after use, or after "Try again") starts clean.
  const round = resetKey + retries;
  const roundRef = useRef(round);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const status: CheckStatus =
    got && got.key === round ? "success" : failed ? "error" : started ? "verifying" : "idle";

  const handleToken = useCallback(
    (token: string | null) => {
      setGot(token ? { token, key: roundRef.current } : null);
      if (token) setFailed(false);
      onToken(token);
    },
    [onToken],
  );
  const handleFail = useCallback(() => setFailed(true), []);
  const handleRendered = useCallback(() => setStarted(true), []);
  // Cloudflare is sure about most visitors; for the rest it shows one tick box, which needs a word of
  // explanation so it doesn't look out of place.
  const [asking, setAsking] = useState(false);
  const handleInteractive = useCallback((active: boolean) => setAsking(active), []);

  useEffect(() => {
    if (status !== "verifying") return;
    const id = setTimeout(() => setFailed(true), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, [status]);

  const retry = () => {
    setFailed(false);
    setRetries((n) => n + 1);
  };

  return (
    <>
      <div className="hc" data-status={status}>
        <Halo status={status} />
        <div className="hc-text" role="status" aria-live="polite">
          <b>{asking && status === "verifying" ? "One quick step needed" : LABEL[status]}</b>
          <small>
            {asking && status === "verifying" ? "Tick the box below to continue." : "Protected by Cloudflare"}
          </small>
          {status === "error" && (
            <button type="button" className="btn btn-hollow btn-xs" onClick={retry}>
              Try again
            </button>
          )}
        </div>
      </div>
      <div className={asking ? "hc-ts asking" : "hc-ts"}>
        <Turnstile
          onToken={handleToken}
          onFail={handleFail}
          onRendered={handleRendered}
          onInteractive={handleInteractive}
          resetKey={round}
        />
      </div>
    </>
  );
}

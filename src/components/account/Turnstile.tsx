"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** The public site key. It is meant to be seen in the page; the secret key lives only in Supabase. */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAF_PgIfVX1vyJxQr";

type Api = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
const api = () => (window as unknown as { turnstile?: Api }).turnstile;

/**
 * Cloudflare's human check, doing the real verifying. It draws nothing unless the visitor has to act
 * (then its own box appears here); the parent shows the status in its own way. It hands over a one-use
 * token, or null when there is none. Change `resetKey` to ask for a fresh token.
 */
export function Turnstile({
  onToken,
  onFail,
  onRendered,
  onInteractive,
  resetKey,
}: {
  onToken: (token: string | null) => void;
  onFail: () => void;
  /** The check has started running. */
  onRendered: () => void;
  /** Cloudflare needs the visitor to tick a box (true), or no longer does (false). */
  onInteractive: (active: boolean) => void;
  resetKey: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef("");
  const handlers = useRef({ onToken, onFail, onRendered, onInteractive });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    handlers.current = { onToken, onFail, onRendered, onInteractive };
  }, [onToken, onFail, onRendered, onInteractive]);

  useEffect(() => {
    const el = box.current;
    const turnstile = api();
    if (!ready || !el || !turnstile || widget.current) return;
    const fail = () => {
      handlers.current.onToken(null);
      handlers.current.onFail();
    };
    widget.current = turnstile.render(el, {
      sitekey: SITE_KEY,
      theme: "dark",
      appearance: "interaction-only",
      // The flexible widget is at least 300px wide; on a narrow phone the compact one fits.
      size: el.clientWidth < 300 ? "compact" : "flexible",
      callback: (token: string) => {
        handlers.current.onInteractive(false);
        handlers.current.onToken(token);
      },
      "before-interactive-callback": () => handlers.current.onInteractive(true),
      "after-interactive-callback": () => handlers.current.onInteractive(false),
      "expired-callback": () => handlers.current.onToken(null),
      "error-callback": fail,
      "timeout-callback": fail,
      "unsupported-callback": fail,
    });
    handlers.current.onRendered();
    return () => {
      if (widget.current) api()?.remove(widget.current);
      widget.current = "";
    };
  }, [ready]);

  useEffect(() => {
    if (resetKey && widget.current) api()?.reset(widget.current);
  }, [resetKey]);

  return (
    <>
      <Script src={SRC} strategy="afterInteractive" onReady={() => setReady(true)} onError={onFail} />
      <div ref={box} className="lg-ts" />
    </>
  );
}

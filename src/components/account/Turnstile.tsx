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
 * Cloudflare's human check: its own widget, doing the real verifying. It hands over a one-use token,
 * or null when there is none. Change `resetKey` to ask for a fresh token.
 */
export function Turnstile({
  onToken,
  onFail,
  resetKey,
}: {
  onToken: (token: string | null) => void;
  onFail: () => void;
  resetKey: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef("");
  const handlers = useRef({ onToken, onFail });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    handlers.current = { onToken, onFail };
  }, [onToken, onFail]);

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
      appearance: "always",
      // The flexible widget is at least 300px wide; on a narrow phone the compact one fits.
      size: el.clientWidth < 300 ? "compact" : "flexible",
      callback: (token: string) => handlers.current.onToken(token),
      "expired-callback": () => handlers.current.onToken(null),
      "error-callback": fail,
      "timeout-callback": fail,
      "unsupported-callback": fail,
    });
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

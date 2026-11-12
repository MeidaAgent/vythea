"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

type Props = { full?: boolean; wide?: boolean; className?: string };

/**
 * Contract-address chip. Once `SITE.contract` is set it shows the VYTH contract and copies it
 * on click; until then it says plainly that the token is not live.
 */
export function CaChip({ full, wide, className }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const cls = ["ca", full && "ca-full", wide && "ca-wide", className].filter(Boolean).join(" ");
  const contract = SITE.contract;

  if (!contract) {
    return (
      <span
        className={cls}
        style={{ cursor: "default" }}
        aria-label="VYTH contract address: not deployed yet"
      >
        <span className="ca-k">CA</span>
        <span className="ca-v">{full ? "Not deployed yet" : "Not live"}</span>
        <span className="ca-c">Soon</span>
      </span>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(contract!);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  const shown = full ? contract : `${contract.slice(0, 6)}…${contract.slice(-4)}`;

  return (
    <button
      type="button"
      className={cls}
      title={contract}
      aria-label={`CA ${shown}: copy the VYTH contract address ${contract}`}
      onClick={copy}
    >
      <span className="ca-k">CA</span>
      <span className="ca-v">{shown}</span>
      <span className="ca-c" aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

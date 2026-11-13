"use client";

import { useState } from "react";

/** A read-only value with a button that copies it. */
export function CopyField({ value, label, action = "Copy link" }: { value: string; label: string; action?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the value stays selectable in the box */
    }
  };

  return (
    <div className="cf">
      <input readOnly value={value} aria-label={label} onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="btn btn-fill btn-xs" onClick={copy}>
        {copied ? "Copied" : action}
      </button>
    </div>
  );
}

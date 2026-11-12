"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { detectOs, type Os } from "@/lib/site";

const SH = "curl -fsSL https://vythea.ai/install.sh | sh";

const BUILDS: {
  id: Os;
  name: string;
  kind: string;
  prompt: string;
  command: string;
  needs: string;
  then: string;
  file?: string;
}[] = [
  {
    id: "mac",
    name: "macOS",
    kind: ".dmg",
    prompt: "$",
    command: SH,
    needs: "13 or later, Apple silicon",
    then: "Paste it into Terminal: it installs the app and the vythea command, then opens Vythea.",
    file: "Using the .dmg instead? The first time, click Open Anyway in System Settings › Privacy & Security.",
  },
  {
    id: "win",
    name: "Windows",
    kind: ".zip",
    prompt: "PS>",
    command: "irm https://vythea.ai/install.ps1 | iex",
    needs: "11, x64",
    then: "Paste it into PowerShell: it installs Vythea and walks you through setup.",
  },
  {
    id: "linux",
    name: "Linux",
    kind: ".tar.gz",
    prompt: "$",
    command: SH,
    needs: "x64, glibc 2.31 or later",
    then: "Paste it into a terminal: it installs Vythea and walks you through setup.",
  },
];

/** Keeps the URL on one line when the command wraps. */
const split = (command: string) => {
  const at = command.indexOf(" https://");
  return [command.slice(0, at), command.slice(at + 1)];
};

export function Builds() {
  const [os, setOs] = useState<Os>("mac");
  const [copied, setCopied] = useState<Os | "">("");
  const [problem, setProblem] = useState<Partial<Record<Os, string>>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lines = useRef<Partial<Record<Os, HTMLElement | null>>>({});

  useEffect(() => setOs(detectOs()), []);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  // This computer's build first.
  const ordered = useMemo(() => [...BUILDS].sort((a, b) => Number(b.id === os) - Number(a.id === os)), [os]);

  async function copy(id: Os, command: string) {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const el = lines.current[id];
      if (el) getSelection()?.selectAllChildren(el);
      return;
    }
    setCopied(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(""), 1800);
  }

  return (
    <>
      <div className="builds">
        {ordered.map((b) => {
          const [head, url] = split(b.command);
          return (
            <article key={b.id} className={`build${b.id === os ? " mine" : ""}`}>
              <p className="micro">{b.id === os ? "This computer" : "Also for"}</p>
              <h2 className="build-name">{b.name}</h2>
              <p className="build-needs">{b.needs}</p>
              <div className="cmd" dir="ltr">
                <p className="cmd-text">
                  <span className="cmd-p" aria-hidden="true">
                    {b.prompt}
                  </span>
                  <code
                    className="cmd-line"
                    ref={(el) => {
                      lines.current[b.id] = el;
                    }}
                  >
                    <span className="cmd-nb">{head}</span> <span className="cmd-nb">{url}</span>
                  </code>
                </p>
                <button
                  type="button"
                  className="cmd-copy"
                  aria-label="Copy the install command"
                  onClick={() => copy(b.id, b.command)}
                >
                  {copied === b.id ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="build-then">{b.then}</p>
              <button
                type="button"
                className="btn btn-line btn-xs"
                onClick={() =>
                  // The original asks its API for a signed link to the installer; this build has no backend.
                  setProblem((p) => ({ ...p, [b.id]: "Downloads are not switched on yet. Try again soon." }))
                }
              >
                <span>Download {b.kind}</span>
              </button>
              {b.file && <p className="build-file">{b.file}</p>}
              {problem[b.id] && (
                <p className="dash-problem" role="alert">
                  {problem[b.id]}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? "Install command copied" : ""}
      </span>
    </>
  );
}

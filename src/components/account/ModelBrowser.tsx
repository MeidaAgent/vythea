"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { fmtUsd } from "@/lib/format";

export type Model = {
  id: string;
  name: string;
  provider: string;
  tier: "free" | "paid";
  context_k: number | null;
  output_k: number | null;
  knows_to: string | null;
  tools: boolean;
  reasoning: boolean;
  vision: boolean;
  input_per_m: number | null;
  output_per_m: number | null;
};

/** 1000 -> "1M", 128 -> "128K" */
const size = (k: number | null) => (k == null ? "—" : k >= 1000 ? `${+(k / 1000).toFixed(1)}M` : `${k}K`);

export function ModelBrowser({ models }: { models: Model[] }) {
  const [provider, setProvider] = useState("All");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");

  const providers = useMemo(() => {
    const counts = new Map<string, number>();
    models.forEach((m) => counts.set(m.provider, (counts.get(m.provider) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [models]);

  const shown = models.filter(
    (m) =>
      (provider === "All" || m.provider === provider) &&
      `${m.name} ${m.id} ${m.provider}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const copy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? "" : c)), 1600);
    } catch {
      /* clipboard blocked: the id is shown on the card, so it can be selected by hand */
    }
  };

  return (
    <>
      <div className="mdl-bar">
        <label className="mdl-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder="Search models"
            aria-label="Search models"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="mdl-chips" role="group" aria-label="Filter by provider">
          {[["All", models.length] as const, ...providers].map(([name, n]) => (
            <button
              key={name}
              type="button"
              className="mdl-chip"
              aria-pressed={provider === name}
              onClick={() => setProvider(name)}
            >
              {name} <span>{n}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mdl-count micro">
        {shown.length} {shown.length === 1 ? "model" : "models"}
      </p>

      {shown.length === 0 ? (
        <p className="acct-note">No model matches that search.</p>
      ) : (
        <ul className="mdl-grid">
          {shown.map((m) => (
            <li key={m.id} className="mdl-card">
              <p className="mdl-prov micro">
                {m.provider}
                <span>{m.tier === "free" ? "Free tier" : "Paid credit"}</span>
              </p>
              <div className="mdl-id">
                <code>{m.id}</code>
                <button type="button" onClick={() => copy(m.id)} aria-label={`Copy ${m.id}`}>
                  {copied === m.id ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied === m.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <dl className="mdl-spec">
                <div>
                  <dt className="micro">Context</dt>
                  <dd>{size(m.context_k)}</dd>
                </div>
                <div>
                  <dt className="micro">Output</dt>
                  <dd>{size(m.output_k)}</dd>
                </div>
                <div>
                  <dt className="micro">Knows to</dt>
                  <dd>{m.knows_to ?? "—"}</dd>
                </div>
              </dl>
              <p className="mdl-tags">
                {m.tools && <span>Tools</span>}
                {m.reasoning && <span>Reasoning</span>}
                {m.vision && <span>Sees images</span>}
              </p>
              <p className="mdl-price">
                {m.input_per_m == null || m.output_per_m == null
                  ? "Price soon"
                  : `${fmtUsd(Number(m.input_per_m))} in / ${fmtUsd(Number(m.output_per_m))} out per 1M tokens`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

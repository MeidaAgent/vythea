"use client";

import { useMemo, useState } from "react";
import { KIND_LABEL, MODELS, type Kind, type Model } from "@/content/prices";

const usd = (n: number | undefined) =>
  n == null ? "–" : "$" + (n >= 1 ? n.toFixed(2) : String(+n.toPrecision(2)));
const cheaper = (a: number | undefined, b: number) => a != null && a < b;

/** Saving against the maker's own price, weighted three input tokens to one output token. */
function saving(m: Extract<Model, { kind: "chat" }>) {
  const r = m.price.retail;
  if (!r) return 0;
  const ours = 3 * m.price.input + m.price.output;
  const theirs = 3 * r.input + r.output;
  return theirs > 0 ? Math.floor((1 - ours / theirs) * 100) : 0;
}

export function PriceList() {
  const [kind, setKind] = useState<Kind>("chat");
  const [query, setQuery] = useState("");

  const kinds = useMemo(
    () => (Object.keys(KIND_LABEL) as Kind[]).filter((k) => MODELS.some((m) => m.kind === k)),
    [],
  );
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cost = (m: Model) => (m.kind === "chat" ? m.price.output : m.price.usd);
    return MODELS.filter(
      (m) => m.kind === kind && (!q || m.id.toLowerCase().includes(q) || m.maker.toLowerCase().includes(q)),
    ).sort((a, b) => a.maker.localeCompare(b.maker) || cost(a) - cost(b));
  }, [kind, query]);

  return (
    <>
      <div className="pr-bar">
        <div className="pr-tabs" role="tablist" aria-label="Kind">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              className={`pr-tab${k === kind ? " on" : ""}`}
              aria-selected={k === kind}
              onClick={() => setKind(k)}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="pr-find"
          placeholder="Search models or makers"
          aria-label="Search models or makers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <p className="micro">Sample rows · connect your own price feed in src/content/prices.ts</p>

      <div className="pr-wrap">
        <table className="pr-table">
          {kind === "chat" ? (
            <thead>
              <tr>
                <th>Model</th>
                <th>Maker</th>
                <th className="num">Input / 1M</th>
                <th className="num">Output / 1M</th>
                <th className="num">Retail in / out</th>
                <th className="num">You save</th>
              </tr>
            </thead>
          ) : (
            <thead>
              <tr>
                <th>Model</th>
                <th>Maker</th>
                <th className="num">Price</th>
                <th className="num">On Pro</th>
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((m) =>
              m.kind === "chat" ? (
                <tr key={m.id}>
                  <td className="id">{m.id}</td>
                  <td className="mute">{m.maker}</td>
                  <td className="num">
                    {usd(m.price.input)}
                    {cheaper(m.price.pro?.input, m.price.input) && (
                      <small>Pro {usd(m.price.pro?.input)}</small>
                    )}
                  </td>
                  <td className="num">
                    {usd(m.price.output)}
                    {cheaper(m.price.pro?.output, m.price.output) && (
                      <small>Pro {usd(m.price.pro?.output)}</small>
                    )}
                  </td>
                  <td className="num mute">
                    {m.price.retail ? `${usd(m.price.retail.input)} / ${usd(m.price.retail.output)}` : "–"}
                  </td>
                  <td className="num">
                    {saving(m) > 0 ? <b className="save">{saving(m)}%</b> : <span className="mute">–</span>}
                  </td>
                </tr>
              ) : (
                <tr key={m.id}>
                  <td className="id">{m.id}</td>
                  <td className="mute">{m.maker}</td>
                  <td className="num">
                    {usd(m.price.usd)} <span className="mute">/ {m.price.unit}</span>
                  </td>
                  <td className="num mute">{cheaper(m.price.pro, m.price.usd) ? usd(m.price.pro) : "–"}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {!rows.length && <p className="micro">No model matches.</p>}
      </div>
    </>
  );
}

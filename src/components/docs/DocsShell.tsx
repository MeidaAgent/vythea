"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { LANGUAGES } from "@/lib/site";
import type { IndexEntry, NavGroup, NavItem } from "@/lib/docs";
import { useLanguage } from "@/lib/use-language";

type Props = {
  groups: NavGroup[];
  /** Every page the search box can find. */
  entries: IndexEntry[];
  /** hrefs that have a page in this build. */
  available: string[];
  children: ReactNode;
};

const contains = (item: NavItem, path: string): boolean =>
  item.href === path || item.children.some((c) => contains(c, path));

function Tree({
  items,
  depth,
  path,
  available,
}: {
  items: NavItem[];
  depth: number;
  path: string;
  available: Set<string>;
}) {
  return (
    <ul className="tree" style={{ "--d": depth } as CSSProperties}>
      {items.map((item) => (
        <Branch key={item.href} item={item} depth={depth} path={path} available={available} />
      ))}
    </ul>
  );
}

function Branch({
  item,
  depth,
  path,
  available,
}: {
  item: NavItem;
  depth: number;
  path: string;
  available: Set<string>;
}) {
  const [open, setOpen] = useState(() => contains(item, path));
  useEffect(() => {
    if (contains(item, path)) setOpen(true);
  }, [item, path]);

  return (
    <li>
      <div className="row">
        {available.has(item.href) ? (
          <Link href={item.href} className="link" aria-current={item.href === path ? "page" : undefined}>
            {item.label}
          </Link>
        ) : (
          <span className="link" style={{ opacity: 0.5 }}>
            {item.label}
          </span>
        )}
        {item.children.length > 0 && (
          <button
            className="fold"
            type="button"
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} pages under ${item.label}`}
            onClick={() => setOpen((v) => !v)}
          >
            ›
          </button>
        )}
      </div>
      {open && item.children.length > 0 && (
        <Tree items={item.children} depth={depth + 1} path={path} available={available} />
      )}
    </li>
  );
}

export function DocsShell({ groups, entries, available, children }: Props) {
  const path = usePathname().replace(/\/$/, "") || "/docs";
  const isIndex = path === "/docs";
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [lang, setLang] = useLanguage();
  const set = useMemo(() => new Set(available), [available]);

  useEffect(() => {
    setMenu(false);
    setQuery("");
  }, [path]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    return entries
      .filter(
        (e) => set.has(e.href) && (e.title.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [entries, query, set]);

  return (
    <main id="main" className="docs paper">
      <div className="shell docs-in">
        <header className="docs-top">
          <Link href="/" className="docs-home" aria-label="Vythea home">
            <Wordmark />
          </Link>
          <div className="docs-search" style={{ position: "relative" }}>
            <input
              type="search"
              placeholder="Search the guide"
              aria-label="Search the guide"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {hits && (
              <ul className="docs-hits">
                {hits.map((h) => (
                  <li key={h.href}>
                    <Link href={h.href}>
                      {h.title}
                      <span className="docs-hit-d">{h.desc}</span>
                    </Link>
                  </li>
                ))}
                {!hits.length && <li className="docs-none">Nothing found.</li>}
              </ul>
            )}
          </div>
          <label className="docs-lang">
            <span className="sr">Language</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} lang={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <a
            className="docs-gh micro"
            href="https://github.com/gadlus/vythea-docs"
            target="_blank"
            rel="noopener"
          >
            GitHub ↗
          </a>
        </header>

        <div className="docs-grid">
          {!isIndex && (
            <button
              type="button"
              className="docs-menu micro"
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              Guide {menu ? "−" : "+"}
            </button>
          )}
          <nav
            className={`${isIndex ? "docs-nav-index " : menu ? "" : "docs-nav-shut "}docs-nav`}
            aria-label="Guide"
          >
            <p className="micro">
              <Link href="/docs" aria-current={isIndex ? "page" : undefined}>
                Guide
              </Link>
            </p>
            {groups.map((g) => (
              <section key={g.title}>
                <p className="micro docs-group">{g.title}</p>
                <Tree items={g.items} depth={0} path={path} available={set} />
              </section>
            ))}
          </nav>
          {children}
        </div>
      </div>
    </main>
  );
}

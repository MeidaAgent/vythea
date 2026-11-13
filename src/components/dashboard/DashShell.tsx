"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { LangPicker } from "@/components/ui/LangPicker";
import { fmtUsd } from "@/lib/format";

type Item = { to: string; label: string; art: string; built?: boolean };

// The dashboard sections. Overview, Settings and API keys do real work; the others are pages that say
// plainly when the feature opens.
const GROUPS: { name: string; items: Item[] }[] = [
  {
    name: "Workspace",
    items: [
      { to: "/dashboard", label: "Overview", art: "cap-agent" },
      { to: "/dashboard/usage", label: "Usage", art: "cap-memory" },
      { to: "/dashboard/cloud", label: "Cloud", art: "cap-chat" },
      { to: "/dashboard/models", label: "Models", art: "cap-extend" },
      { to: "/dashboard/keys", label: "API keys", art: "cap-auto", built: true },
    ],
  },
  {
    name: "Account",
    items: [
      { to: "/dashboard/billing", label: "Billing", art: "plate-pro" },
      { to: "/dashboard/team", label: "Team", art: "cap-delegate" },
      { to: "/dashboard/referrals", label: "Referrals", art: "plate-free" },
      { to: "/dashboard/devices", label: "Devices", art: "plat-linux" },
      { to: "/dashboard/settings", label: "Settings", art: "cap-auto" },
    ],
  },
  {
    name: "Install",
    items: [{ to: "/dashboard/download", label: "Download", art: "plat-mac", built: true }],
  },
];
const ITEMS = GROUPS.flatMap((g) => g.items);

export function DashShell({
  children,
  name,
  avatar,
  credit,
}: {
  children: ReactNode;
  /** Who is signed in, for the foot of the sidebar; null when nobody is. */
  name?: string | null;
  /** Their picture: the GitHub photo, or the house character when they have none. */
  avatar?: string | null;
  /** Credit balance in USD for the sidebar card; null when nobody is signed in. */
  credit?: number | null;
}) {
  const pathname = usePathname().replace(/\/$/, "");
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const here =
    ITEMS.find((i) => (i.to === "/dashboard" ? pathname === i.to : pathname.startsWith(i.to))) ?? ITEMS[0];

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className={`dash-shell${open ? " open" : ""}`}>
      <aside
        className="side"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <div className="side-top">
          <Link href="/" className="side-home" aria-label="Vythea home">
            <Wordmark />
          </Link>
          <button
            ref={toggle}
            type="button"
            className="side-toggle"
            aria-expanded={open}
            aria-controls="side-nav"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
        <nav id="side-nav" className="side-nav" aria-label="Dashboard">
          {GROUPS.map((group) => (
            <div className="side-group" key={group.name}>
              <p className="side-gname">{group.name}</p>
              {group.items.map((item) => {
                const n = <span className="side-n">{String(ITEMS.indexOf(item) + 1).padStart(2, "0")}</span>;
                return (
                  <Link key={item.to} href={item.to} className={`side-link${item === here ? " on" : ""}`}>
                    {n}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        {credit != null && (
          <Link href="/dashboard/billing" className="side-cc">
            <span className="side-cc-top">
              <span className="micro">Credit</span>
              <em>Free</em>
            </span>
            <strong>{fmtUsd(credit)}</strong>
            <span className="micro">Add credit →</span>
          </Link>
        )}
        <div className="side-links">
          <Link href="/docs">Guide</Link>
          <Link href="/benchmark">Benchmark</Link>
          <a href="mailto:support@vythea.com">Support</a>
        </div>
        {name && (
          <Link href="/dashboard/settings" className="side-user">
            {avatar ? (
              <img src={avatar} alt="" width={28} height={28} referrerPolicy="no-referrer" />
            ) : (
              <span aria-hidden="true">{name.replace(/^0x/i, "").charAt(0).toUpperCase()}</span>
            )}
            {name}
          </Link>
        )}
      </aside>

      <div className="dash-col">
        <header className="dash-bar">
          <p className="crumb">
            <Link href="/">Vythea</Link>
            <span>{"//"}</span>
            <b className="crumb-here">{here.label}</b>
          </p>
          <div className="bar-right">
            <span className="dl-status">
              <i />
              All systems running
            </span>
            <Link href="/dashboard/download" className="btn btn-line btn-xs">
              Get the app
            </Link>
            <LangPicker />
          </div>
        </header>
        <main id="main" className="dash-main">
          <div
            className="dash-art"
            aria-hidden="true"
            style={{ "--art": `url(/assets/art/${here.art}.png)` } as CSSProperties}
          />
          {children}
        </main>
      </div>
    </div>
  );
}

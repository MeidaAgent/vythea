"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type Tier = {
  art: "free" | "pro" | "team";
  name: string;
  badge?: string;
  /** Monthly price in USD. */
  month: number;
  /** Price of a year paid at once, where the plan has one. */
  year?: number;
  per: { month: string; year: string };
  line: string;
  feats: string[];
  cta: { label: string; href: string; fill?: boolean };
};

const TIERS: Tier[] = [
  {
    art: "free",
    name: "Free",
    month: 0,
    per: { month: "forever", year: "forever" },
    line: "Bring your own keys.",
    feats: [
      "Local agent, unlimited sessions",
      "Plain-text memory on disk",
      "Any model endpoint you own",
      "Community support",
    ],
    cta: { label: "Download", href: "#platforms" },
  },
  {
    art: "pro",
    name: "Pro",
    badge: "Most chosen",
    month: 20,
    year: 199.2,
    per: { month: "per month", year: "per year" },
    line: "Hosted models included.",
    feats: [
      "Everything in Free",
      "$20 of hosted credit a month, or $240 at once on yearly",
      "Lower prices on every hosted model",
      "Vythea Cloud: tasks, services and web apps",
      "Three times the requests a minute",
      "Cancel any time",
    ],
    cta: { label: "Start Pro", href: "/price", fill: true },
  },
  {
    art: "team",
    name: "Team",
    month: 18,
    year: 183.6,
    per: { month: "per seat, monthly, 2 to 5", year: "per seat, yearly, 2 to 5" },
    line: "One credit pool for the whole team.",
    feats: [
      "Everything in Free",
      "$18 of shared credit per seat, monthly",
      "Three times the requests a minute",
      "Per-member spending limits",
      "Audit log of every change",
    ],
    cta: { label: "Start a team", href: "/docs/teams" },
  },
];

const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
const saving = (t: Tier) => (t.year ? Math.round((1 - t.year / (t.month * 12)) * 100) : 0);
const BEST = Math.max(...TIERS.map(saving));

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="band blue" id="pricing">
      <div className="shell">
        <div className="band-top">
          <p className="micro">Pricing</p>
          <h2>
            Pay for the models,
            <br />
            not the seat.
          </h2>
        </div>

        <div className="cycle" role="group" aria-label="Billing period">
          <button
            type="button"
            className={yearly ? "" : "on"}
            aria-pressed={!yearly}
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>
          <button
            type="button"
            className={yearly ? "on" : ""}
            aria-pressed={yearly}
            onClick={() => setYearly(true)}
          >
            Yearly <span>save up to {BEST}%</span>
          </button>
        </div>

        <div className="tiers">
          {TIERS.map((tier) => {
            const onYear = yearly && tier.year !== undefined;
            const price = money(onYear ? tier.year! : tier.month);
            return (
              <article className={`tier${tier.badge ? " hot" : ""}`} key={tier.art}>
                <p className="tier-head">
                  <span className="label">{tier.name}</span>
                  {tier.badge && <span className="label line">{tier.badge}</span>}
                </p>
                <p className="tier-price">
                  <span className="tier-cur">$</span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={price}
                      className="tier-num"
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {price}
                    </motion.span>
                  </AnimatePresence>
                  <span className="tier-per">{yearly ? tier.per.year : tier.per.month}</span>
                </p>
                <p className="micro tier-save">
                  {onYear ? `Save ${saving(tier)}% · $${money(tier.month * 12 - tier.year!)} a year` : " "}
                </p>
                <p className="tier-line">{tier.line}</p>
                <div className="tier-art">
                  <img
                    src={`/assets/art/plate-${tier.art}.png`}
                    alt=""
                    width={640}
                    height={280}
                    loading="lazy"
                  />
                </div>
                <ul className="tier-feats">
                  {tier.feats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {tier.cta.href.startsWith("#") ? (
                  <a className={`btn ${tier.cta.fill ? "btn-fill" : "btn-invert"}`} href={tier.cta.href}>
                    <span>{tier.cta.label}</span>
                  </a>
                ) : (
                  <Link className={`btn ${tier.cta.fill ? "btn-fill" : "btn-invert"}`} href={tier.cta.href}>
                    <span>{tier.cta.label}</span>
                  </Link>
                )}
              </article>
            );
          })}
        </div>
        <p className="micro tiers-note">
          Prices in USD. Local use is free forever; you only pay for hosted models and Vythea Cloud, whose
          compute is about $6 per GB a month from credit.
        </p>
      </div>
    </section>
  );
}

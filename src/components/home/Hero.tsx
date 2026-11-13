"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { OsIcon } from "@/components/brand/Mark";
import { Wordmark } from "@/components/brand/Wordmark";
import { CaChip } from "@/components/ui/CaChip";
import { LangPicker } from "@/components/ui/LangPicker";
import { InkCanvas } from "./InkCanvas";

const EASE = [0.16, 1, 0.3, 1] as const;

// Headline lines → words, each with the delay of its sweep.
const HEADLINE: { word: string; delay: number }[][] = [
  [{ word: "Intelligence", delay: 0.15 }],
  [
    { word: "in", delay: 0.29 },
    { word: "motion", delay: 0.35 },
  ],
];

const OS_LABEL = { mac: "macOS", win: "Windows", linux: "Linux" } as const;

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  const col = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // The copy drifts down and fades as the hero scrolls away (desktop only).
  useMotionValueEvent(scrollY, "change", (y) => {
    const el = col.current;
    if (!el || !hero.current) return;
    if (innerWidth <= 820 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--py", "0px");
      el.style.setProperty("--po", "1");
      return;
    }
    const e = Math.min(1, Math.max(0, y / Math.max(1, hero.current.offsetHeight - innerHeight * 0.4)));
    el.style.setProperty("--py", `${y * 0.28}px`);
    el.style.setProperty("--po", String(Math.min(1, Math.max(0, 1 - e * 1.35))));
  });

  return (
    <section className="hero" id="top" ref={hero}>
      <InkCanvas />

      <header className="bar">
        <div className="shell bar-in">
          <a className="wordmark" href="#top" aria-label="Vythea">
            <Wordmark />
          </a>
          <div className="nav-r">
            <Link href="/price" className="micro nav-l">
              Model prices
            </Link>
            <Link href="/tokenomics" className="micro nav-l">
              Tokenomics
            </Link>
            <CaChip className="nav-ca" />
            <Link href="/login" className="btn btn-fill btn-xs">
              Sign in
            </Link>
            <Link href="/docs" className="btn btn-hollow btn-xs nav-guide">
              Guide
            </Link>
            <a className="btn btn-fill btn-xs" href="#platforms">
              Install
            </a>
            <LangPicker />
          </div>
        </div>
      </header>

      <div className="shell hero-ca">
        <CaChip wide />
      </div>

      <div className="shell hero-grid">
        <div className="hero-col" ref={col}>
          <h1>
            {HEADLINE.map((line, i) => (
              <span className="sl" key={i}>
                {line.map(({ word, delay }) => (
                  <span className="sl-w" key={word}>
                    <motion.span
                      className="sl-i"
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.95, delay, ease: EASE }}
                    >
                      {word}
                    </motion.span>
                    {" "}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="hero-sub">
            An agent with its own cloud and wallet. It builds on your computer or in Vythea Cloud, hosts the
            result at a live link, pays for the APIs it needs, and is{" "}
            <Link href="/benchmark" className="hero-fast">
              written in Rust: it starts in 8 ms
            </Link>
            .
          </p>
          <div className="hero-cta">
            {/* All three labels render; `html[data-os]` (set before first paint) shows the right one. */}
            <Link className="btn btn-fill" href="/dashboard/download">
              {(["mac", "win", "linux"] as const).map((os) => (
                <span className={`for-os for-${os}`} key={os}>
                  <OsIcon os={os} /> Download for {OS_LABEL[os]}
                </span>
              ))}
            </Link>
            <a className="btn btn-hollow" href="#pricing">
              See pricing
            </a>
          </div>
          <p className="micro term hero-alpha">Alpha · free with an account · macOS, Windows, Linux</p>
        </div>
      </div>
    </section>
  );
}

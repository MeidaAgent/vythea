"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { Wordmark } from "@/components/brand/Wordmark";
import { SOCIAL_PATHS } from "@/lib/icon-paths";
import { LANGUAGES } from "@/lib/site";
import { useLanguage } from "@/lib/use-language";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#platforms", label: "Platforms" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/price", label: "Model prices" },
      { href: "/#faq", label: "FAQ" },
      { href: "/try", label: "Playground" },
      { href: "/dashboard/download", label: "Download" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/docs", label: "Guide" },
      { href: "/benchmark", label: "Benchmark" },
      { href: "/vyth", label: "VYTH" },
      { href: "/tokenomics", label: "Tokenomics" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "mailto:support@vythea.ai", label: "Support" },
      { href: "mailto:hi@vythea.ai", label: "Say hi" },
    ],
  },
] as const;

const SOCIAL = [
  { key: "github", label: "GitHub", href: "https://github.com/gadlus" },
  { key: "x", label: "X", href: "https://x.com/VytheaAgent" },
] as const;

/**
 * Deep-blue footer. When it fits in the viewport it is pinned behind the page, and the page
 * scrolls away to uncover it: `--reveal` (0 → 1) drives its fade, blur and lift.
 */
export function SiteFooter() {
  const foot = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [clear, setClear] = useState(true);
  const [lang, setLang] = useLanguage();
  const { scrollY } = useScroll();

  useEffect(() => {
    const el = foot.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setHeight(h);
      setPinned(h <= window.innerHeight && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const update = (y: number) => {
    const el = foot.current;
    if (!el) return;
    if (!pinned || !height) {
      el.style.setProperty("--reveal", "1");
      setClear(true);
      return;
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const reveal = Math.min(1, Math.max(0, 1 - (max - y) / height));
    el.style.setProperty("--reveal", reveal.toFixed(3));
    setClear(reveal > 0.995);
  };

  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => {
    update(window.scrollY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned, height]);

  return (
    <>
      {pinned && <div aria-hidden="true" style={{ height, pointerEvents: "none" }} />}
      <footer ref={foot} className={`foot${pinned ? " pinned" : ""}${clear ? " clear" : ""}`} id="contact">
        <div className="foot-in">
          <div className="shell">
            <p className="foot-big" aria-hidden="true" data-word="Vythea" />
            <div className="foot-top">
              <div>
                <Wordmark />
                <p className="micro foot-tag">Intelligence in Motion</p>
                <p className="foot-note">
                  A small team, building in the open and open to work. If that sounds like you, say hi at{" "}
                  <a className="foot-mail" href="mailto:hi@vythea.ai">
                    hi@vythea.ai
                  </a>
                </p>
              </div>
              {COLUMNS.map((col) => (
                <nav className="foot-col" key={col.title} aria-label={col.title}>
                  <p className="micro">{col.title}</p>
                  {col.links.map((l) =>
                    l.href.startsWith("/") ? (
                      <Link key={l.href} href={l.href}>
                        {l.label}
                      </Link>
                    ) : (
                      <a key={l.href} href={l.href}>
                        {l.label}
                      </a>
                    ),
                  )}
                </nav>
              ))}
            </div>
            <div className="foot-base">
              <span className="micro foot-co">© 2026 Vythea</span>
              <nav className="foot-langs" aria-label="Language">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className="micro"
                    lang={l.code}
                    aria-current={l.code === lang ? "true" : undefined}
                    onClick={() => setLang(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
              </nav>
              <span className="foot-social">
                {SOCIAL.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    aria-label={s.label}
                    title={s.label}
                    target="_blank"
                    rel="noopener"
                  >
                    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true">
                      <path fill="currentColor" d={SOCIAL_PATHS[s.key]} />
                    </svg>
                  </a>
                ))}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

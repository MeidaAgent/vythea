"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scroll } from "framer-motion";
import { revealSelectors } from "@/lib/reveal-selectors";

type Sheet = keyof typeof revealSelectors;

/**
 * Scroll reveal. The stylesheets keep each revealable block hidden until it gets the `in` class;
 * this adds it when the block scrolls into view, staggering blocks that arrive together.
 *
 * Positions are measured directly rather than with an IntersectionObserver: several blocks are
 * hidden with a full `clip-path`, and a fully clipped element never counts as intersecting.
 */
export function RevealScope({ sheets }: { sheets: Sheet[] }) {
  const pathname = usePathname();
  const key = sheets.join(",");

  useEffect(() => {
    const selector = key
      .split(",")
      .flatMap((s) => revealSelectors[s as Sheet] as readonly string[])
      .join(",");
    if (!selector) return;

    let pending = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.classList.contains("in"),
    );

    const check = () => {
      if (!pending.length) return;
      const edge = window.innerHeight * 0.92;
      let batch = 0;
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top > edge || r.bottom < 0) return true;
        el.style.transitionDelay = `${Math.min(batch++, 5) * 90}ms`;
        el.classList.add("in");
        return false;
      });
    };

    check();
    const stop = scroll(check);
    window.addEventListener("resize", check);
    window.addEventListener("load", check);
    return () => {
      stop();
      window.removeEventListener("resize", check);
      window.removeEventListener("load", check);
    };
  }, [key, pathname]);

  return null;
}

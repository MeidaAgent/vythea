"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { Star } from "@/components/brand/Mark";

const CIRC = 2 * Math.PI * 15;

/**
 * Floating pill that drops in once the hero's own bar has scrolled away. The ring around
 * the star fills with the page's scroll progress.
 */
export function Dock() {
  const [on, setOn] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });
  const dashoffset = useTransform(progress, (p) => CIRC * (1 - p));

  useMotionValueEvent(scrollY, "change", (y) => setOn(y > window.innerHeight * 0.55));

  return (
    <div className={`dock${on ? " on" : ""}`} aria-hidden={!on} inert={!on}>
      <a className="dock-home" href="#top" aria-label="Back to top">
        <svg viewBox="0 0 36 36" width={36} height={36} className="dock-ring" aria-hidden="true">
          <circle cx="18" cy="18" r="15" className="dock-track" />
          <motion.circle
            cx="18"
            cy="18"
            r="15"
            className="dock-fill"
            strokeDasharray={CIRC}
            style={{ strokeDashoffset: dashoffset, transition: "none" }}
          />
        </svg>
        <Star className="dock-star" />
      </a>
      <span className="dock-sep" aria-hidden="true" />
      <a className="micro dock-l" href="#capabilities">
        Capabilities
      </a>
      <a className="micro dock-l" href="#pricing">
        Pricing
      </a>
      <Link href="/price" className="micro dock-l dock-more">
        Model prices
      </Link>
      <Link href="/tokenomics" className="micro dock-l dock-more">
        Tokenomics
      </Link>
      <a className="btn btn-fill btn-xs dock-cta" href="#platforms">
        Install
      </a>
    </div>
  );
}

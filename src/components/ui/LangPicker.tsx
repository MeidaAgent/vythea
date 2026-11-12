"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LANGUAGES } from "@/lib/site";
import { useLanguage } from "@/lib/use-language";

/** Header language menu. Only the English copy ships in this build; the choice is remembered. */
export function LangPicker() {
  const [lang, setLang] = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lang" ref={root}>
      <button
        type="button"
        className="lang-btn"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Language: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          viewBox="0 0 30 20"
          width={22}
          height={15}
          className="flag"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <rect x=".5" y=".5" width="29" height="19" strokeWidth="1" />
          <path d="M3 6h24M3 10h24M3 14h16" strokeWidth="1.4" />
        </svg>
        <span className="micro">{current.short}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            className="lang-menu"
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {LANGUAGES.map((l) => (
              <li key={l.code} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={l.code === current.code}
                  lang={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

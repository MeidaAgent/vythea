"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag } from "@/components/ui/Flag";
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
        <Flag code={current.code} />
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
                  <Flag code={l.code} />
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

type Step = { title: string; text: string; href: string; cta: string; done: boolean };

const KEY = "vythea-get-started-hidden";

/** The three first steps, ticked off as the account gets there. It can be hidden for good. */
export function GetStarted({ steps }: { steps: Step[] }) {
  // Start hidden-unknown so the server and the first client render match; then read the choice.
  const [hidden, setHidden] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden !== false) return null;

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* the choice just won't be remembered */
    }
  };

  return (
    <section className="ov-start" aria-labelledby="ov-start-h">
      <div className="ov-start-top">
        <h2 id="ov-start-h" className="micro">
          Get started
        </h2>
        <button type="button" className="btn btn-line btn-xs" onClick={hide}>
          Hide
        </button>
      </div>
      <ol>
        {steps.map((s, i) => (
          <li key={s.title} className={s.done ? "done" : undefined}>
            <span className="ov-n" aria-hidden="true">
              {s.done ? <Check size={14} /> : i + 1}
            </span>
            <div>
              <b>{s.title}</b>
              <p>{s.text}</p>
            </div>
            <Link href={s.href} className="btn btn-line btn-xs">
              {s.cta}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

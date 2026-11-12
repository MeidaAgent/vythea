"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, RotateCcw } from "lucide-react";

type Step = { kind: "plan" | "tool" | "out" | "done"; text: string };

/**
 * A scripted walk-through, not a live model: every run plays one of these recordings.
 * Nothing typed here leaves the page.
 */
const SCRIPTS: { prompt: string; steps: Step[] }[] = [
  {
    prompt: "Fix the failing test in checkout.test.ts",
    steps: [
      { kind: "plan", text: "Read the test, find what it expects, then fix the code rather than the test." },
      { kind: "tool", text: "run  npm test -- checkout" },
      { kind: "out", text: "✗ applies the discount once  ·  expected 90, received 81" },
      { kind: "tool", text: "read  src/checkout/total.ts" },
      {
        kind: "plan",
        text: "applyDiscount() runs in both cartTotal() and orderTotal(). Removing the second call.",
      },
      { kind: "tool", text: "edit  src/checkout/total.ts  (−1 line)" },
      { kind: "tool", text: "run  npm test -- checkout" },
      { kind: "out", text: "✓ 14 passed" },
      { kind: "done", text: "Fixed: the discount was applied twice. One line removed, tests green." },
    ],
  },
  {
    prompt: "Build a landing page for a ceramics studio and host it",
    steps: [
      {
        kind: "plan",
        text: "One page: hero, three pieces, opening hours, a contact form. Then give it a link.",
      },
      { kind: "tool", text: "write  index.html, styles.css, form.js" },
      { kind: "tool", text: "preview  http://localhost:5173" },
      { kind: "out", text: "Rendered at 1440 and 390 wide. Form posts and answers 200." },
      { kind: "tool", text: "cloud  deploy --name ceramics-studio" },
      { kind: "out", text: "Awake in 3.1 s  ·  256 MB  ·  sleeps when nobody is looking" },
      { kind: "done", text: "Live at ceramics-studio.vythea.si (example link, this is a recording)." },
    ],
  },
  {
    prompt: "Watch my shop's stock every hour and email me when it runs low",
    steps: [
      { kind: "plan", text: "A small script on a timer, kept running in Vythea Cloud." },
      { kind: "tool", text: "write  stock.js" },
      { kind: "tool", text: "run  node stock.js --once" },
      { kind: "out", text: "Read 42 items  ·  2 below threshold  ·  test email sent" },
      { kind: "tool", text: "cloud  keep-running stock.js --every 1h" },
      { kind: "done", text: "stock-watch is online. About $1.50 a month from credit." },
    ],
  },
];

const LABEL: Record<Step["kind"], string> = { plan: "Plan", tool: "Tool", out: "Result", done: "Done" };

export function Playground() {
  const [prompt, setPrompt] = useState(SCRIPTS[0].prompt);
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [asked, setAsked] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const log = useRef<HTMLDivElement>(null);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => stop, []);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [steps]);

  function run(text = prompt) {
    const q = text.trim();
    if (!q) return;
    stop();
    // A prompt that isn't one of the examples still plays the closest recording.
    const words = q.toLowerCase().split(/\W+/);
    const score = (s: (typeof SCRIPTS)[number]) =>
      words.filter((w) => w.length > 3 && s.prompt.toLowerCase().includes(w)).length;
    const script = [...SCRIPTS].sort((a, b) => score(b) - score(a))[0];
    setAsked(q);
    setSteps([]);
    setRunning(true);
    script.steps.forEach((step, i) => {
      timers.current.push(
        setTimeout(
          () => {
            setSteps((prev) => [...prev, step]);
            if (i === script.steps.length - 1) setRunning(false);
          },
          550 * (i + 1),
        ),
      );
    });
  }

  function reset() {
    stop();
    setSteps([]);
    setAsked("");
    setRunning(false);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-12">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label htmlFor="pg-prompt" className="micro">
          Your prompt
        </label>
        <textarea
          id="pg-prompt"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
          }}
          className="w-full resize-y border border-hairline-ink bg-transparent p-4 font-sans text-[16px] font-light leading-normal text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue"
        />
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-ink" disabled={running}>
            <CornerDownLeft aria-hidden="true" /> {running ? "Running…" : "Run it"}
          </button>
          <button type="button" className="btn btn-line" onClick={reset} disabled={!steps.length && !running}>
            <RotateCcw aria-hidden="true" /> Clear
          </button>
        </div>

        <p className="micro mt-4">Or try one</p>
        <ul className="m-0 flex list-none flex-col gap-0 p-0">
          {SCRIPTS.map((s) => (
            <li key={s.prompt} className="border-t border-dotted border-hairline-ink last:border-b">
              <button
                type="button"
                className="w-full cursor-pointer border-0 bg-transparent py-3 text-start font-sans text-[15px] font-light text-ink-mute hover:text-ink"
                onClick={() => {
                  setPrompt(s.prompt);
                  run(s.prompt);
                }}
              >
                {s.prompt}
              </button>
            </li>
          ))}
        </ul>
      </form>

      <div className="flex min-h-[380px] flex-col bg-blue-deep text-on-blue" aria-live="polite">
        <div className="flex items-center justify-between gap-3 border-b border-hairline-blue px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-blue/85">
            vythea · recording
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-on-blue/85">
            <i
              className={`inline-block size-[7px] rounded-full ${running ? "animate-pulse bg-on-blue" : "bg-on-blue/40"}`}
            />
            {running ? "working" : steps.length ? "finished" : "idle"}
          </span>
        </div>
        <div
          ref={log}
          className="flex max-h-[520px] flex-1 flex-col gap-3 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
        >
          {!asked && (
            <p className="m-0 text-on-blue/60">Run a prompt to watch a recorded session play back.</p>
          )}
          {asked && (
            <p className="m-0">
              <span className="text-on-blue/60">you › </span>
              {asked}
            </p>
          )}
          <AnimatePresence initial={false}>
            {steps.map((s, i) => (
              <motion.p
                key={i}
                className={`m-0 grid grid-cols-[64px_minmax(0,1fr)] gap-3 ${s.kind === "done" ? "border-t border-hairline-blue pt-3" : ""}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-[10px] uppercase tracking-[0.14em] text-on-blue/60">
                  {LABEL[s.kind]}
                </span>
                <span
                  className={
                    s.kind === "plan"
                      ? "font-sans text-[15px] font-light"
                      : s.kind === "out"
                        ? "text-on-blue/75"
                        : ""
                  }
                >
                  {s.text}
                </span>
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

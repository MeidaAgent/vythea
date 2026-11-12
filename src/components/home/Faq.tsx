"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const QUESTIONS = [
  {
    q: "Does it need an account?",
    a: "No. The app runs locally with your own model keys. An account is for hosted models, and for Vythea Cloud on Pro.",
  },
  {
    q: "Where does my data live?",
    a: "On your disk. Context and memory are plain-text files under ~/.vythea. Nothing leaves the machine unless you connect a hosted model.",
  },
  {
    q: "Which models can I use?",
    a: "Any OpenAI-compatible endpoint, Anthropic, local models through Ollama or llama.cpp, and the hosted pool on Pro.",
  },
  {
    q: "Does it keep memory between sessions?",
    a: "Yes. Memory is written to disk as you work and loaded on the next launch. Edit or delete it like any other file.",
  },
  {
    q: "What happens when I quit?",
    a: "Nothing runs on your machine while the app is closed, and scheduled runs wait for it. Tasks you sent to Vythea Cloud keep going, and anything you asked to keep running stays online.",
  },
  {
    q: "What is Vythea Cloud?",
    a: "The same agent on our servers. Ask in the chat to run a task there, keep a service running, or give a web app its own link. It comes with Pro and is paid from your credit.",
  },
  { q: "Is there a phone app?", a: "Native iPhone and Android apps are coming." },
  {
    q: "Is it open source?",
    a: "The app and the agent are MIT-licensed. The hosted models and Vythea Cloud are the paid parts.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="band paper" id="faq">
      <div className="shell faq-grid">
        <div className="band-top">
          <p className="micro">Questions</p>
          <h2>
            Before you
            <br />
            install.
          </h2>
          <Link className="faq-more" href="/docs">
            Read the guide
          </Link>
        </div>
        <ul className="faq">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li className={`faq-it${isOpen ? " open" : ""}`} key={item.q}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-x" aria-hidden="true" />
                </button>
                <motion.div
                  className="faq-a"
                  id={`faq-a${i}`}
                  role="region"
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  inert={!isOpen}
                >
                  <div>
                    <p>{item.a}</p>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

// Where each chapter starts in the film, in seconds; the last one runs to END.
const CHAPTERS = [
  { at: 2.2, name: "Live tools" },
  { at: 15.5, name: "Any model" },
  { at: 24.6, name: "Own cloud" },
  { at: 45.5, name: "Terminal" },
];
const END = 61.6;

export function TeaserVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);

  // Load and play only while the film is on screen.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (still) return;
        if (entry.isIntersecting) {
          el.preload = "auto";
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = CHAPTERS.reduce((found, c, i) => (time >= c.at - 0.3 ? i : found), -1);
  const fill = (i: number) => {
    const from = CHAPTERS[i].at;
    const to = CHAPTERS[i + 1]?.at ?? END;
    return Math.min(1, Math.max(0, (time - from) / (to - from)));
  };

  const jump = (i: number) => {
    const el = video.current;
    if (!el) return;
    el.currentTime = CHAPTERS[i].at;
    el.play().catch(() => {});
  };
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  const toggleSound = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  return (
    <section className="tz" aria-label="Vythea in a minute">
      <figure className="tz-art" aria-hidden="true">
        <img src="/assets/art/teaser/ship.png" alt="" width={1000} height={1303} loading="lazy" />
      </figure>
      <div className="shell tz-in">
        <p className="micro tz-kicker">See it work</p>
        <h2 className="tz-title">
          Prompt in.
          <br />
          <em>Live link out.</em>
        </h2>
        <p className="tz-sub">
          One run, start to finish: it fixes a bug, switches models mid-session, builds a marketplace in
          Vythea Cloud and hands back a live link, then does it again in the terminal.
        </p>

        <div className="tz-frame">
          <video
            ref={video}
            className="tz-video"
            muted
            loop
            playsInline
            preload="none"
            width={1920}
            height={1080}
            poster="/assets/video/teaser-poster.jpg"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          >
            <source src="/assets/video/teaser.webm" type="video/webm" />
            <source src="/assets/video/teaser.mp4" type="video/mp4" />
          </video>
          <div className="tz-controls">
            <button type="button" className="tz-btn" aria-label={playing ? "Pause" : "Play"} onClick={toggle}>
              {playing ? <Pause size={15} strokeWidth={0} /> : <Play size={15} strokeWidth={0} />}
            </button>
            <button
              type="button"
              className="tz-btn"
              aria-label={muted ? "Sound on" : "Sound off"}
              onClick={toggleSound}
            >
              {muted ? (
                <VolumeX size={15} style={{ fill: "none" }} strokeWidth={1.6} />
              ) : (
                <Volume2 size={15} style={{ fill: "none" }} strokeWidth={1.6} />
              )}
            </button>
          </div>
        </div>

        <ol className="tz-chapters">
          {CHAPTERS.map((c, i) => (
            <li key={c.name}>
              <button
                type="button"
                className={`tz-ch${i === active ? " on" : ""}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => jump(i)}
              >
                <span className="tz-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="tz-name">{c.name}</span>
                <span className="tz-bar">
                  <span style={{ transform: `scaleX(${fill(i)})` }} />
                </span>
              </button>
            </li>
          ))}
        </ol>

        <p className="tz-proof">
          <Link href="/benchmark">Rust · CLI starts in 7.65 ms · 84% on Harness-Bench · Open source</Link>
        </p>
        <p className="micro tz-credit">Art: Gustave Doré, 1876, public domain, dithered by Vythea.</p>
      </div>
    </section>
  );
}

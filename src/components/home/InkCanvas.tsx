"use client";

import { useEffect, useRef, useState } from "react";

const SRC = "/assets/vythea.png";
const COLOR = "#f2f4ff";

// Pointer interaction: dots inside this radius are pushed away, then spring back home.
const REACH = 130;
const PUSH = 2.4;
const SPRING = 0.045;
const DAMPING = 0.86;

// Loose dots: now and then a dot from the outer strands of hair lets go, floats up and fades out.
const MOTE_EVERY = 90; // ms between releases
const MOTE_BATCH = 3;
const MOTE_LIFE = 2.6; // seconds
const MOTE_MAX = 120;
const MOTE_RISE = 110; // px
const MOTE_SWAY = 22; // px, sideways at most

type Mote = { x: number; y: number; s: number; born: number; sway: number };

/**
 * The hero portrait, drawn as a dot matrix on a canvas. The dots gather on load, scatter as the
 * hero scrolls away, part around the cursor, and now and then let go of a loose dot that floats up. If the canvas can't be used, the CSS mask
 * fallback shows instead.
 */
export function InkCanvas({
  place,
  flip = false,
  scatterOnScroll = true,
}: {
  /** Where the portrait sits: its right edge and its width, as fractions of the canvas width. */
  place?: (canvasWidth: number) => { edge: number; width: number };
  /** Mirror the portrait, so she faces the other way. */
  flip?: boolean;
  /** The hero scatters the dots as it scrolls away; other pages keep the portrait whole. */
  scatterOnScroll?: boolean;
} = {}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) {
      setFallback(true);
      return;
    }
    const hero = cv.closest<HTMLElement>(".hero");
    const calm = matchMedia("(pointer: coarse)").matches || innerWidth <= 820;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Cell size of the dot matrix: big enough that the squares read as squares.
    const density = calm ? 6 : 5;
    const img = new Image();

    // Per dot: home position, size, scatter vector, and the live offset + velocity from the pointer.
    let n = 0;
    let home = new Float32Array(0);
    let size = new Float32Array(0);
    let scatter = new Float32Array(0);
    /** 0 near the face, 1 at the outermost strands: loose dots come from the outside. */
    let rim = new Float32Array(0);
    const motes: Mote[] = [];
    let moteTimer: ReturnType<typeof setInterval> | undefined;
    let offset = new Float32Array(0);
    let velocity = new Float32Array(0);

    let intro = still ? 0 : 1;
    let scroll = 0;
    let started = 0;
    let raf = 0;
    let dead = false;
    let pointerX = 0;
    let pointerY = 0;
    let pointerOn = false;

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Same box as the CSS fallback: right half, inset 2.5%, contained, anchored bottom right.
      const spot = place?.(w) ?? { edge: 0.975, width: 0.5 };
      const boxW = w * spot.width;
      const scale = Math.min(boxW / img.width, h / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      const ox = w * spot.edge - iw;
      const oy = h - ih;

      const cols = Math.max(1, Math.floor(iw / density));
      const rows = Math.max(1, Math.floor(ih / density));
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      if (flip) {
        octx.translate(cols, 0);
        octx.scale(-1, 1);
      }
      octx.drawImage(img, 0, 0, cols, rows);
      const data = octx.getImageData(0, 0, cols, rows).data;

      const hs: number[] = [];
      const ss: number[] = [];
      const sc: number[] = [];
      const rm: number[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = data[(r * cols + c) * 4 + 3] / 255;
          if (a < 0.12) continue;
          const angle = Math.random() * Math.PI * 2;
          const dist = 40 + Math.random() * 260;
          hs.push(ox + c * density, oy + r * density);
          ss.push(Math.max(1.5, density * 0.8 * Math.sqrt(a)));
          sc.push(Math.cos(angle) * dist, Math.sin(angle) * dist - 60);
          rm.push(Math.min(1, Math.max(0, (Math.hypot(c / cols - 0.5, r / rows - 0.52) - 0.22) / 0.3)));
        }
      }
      n = ss.length;
      home = Float32Array.from(hs);
      size = Float32Array.from(ss);
      scatter = Float32Array.from(sc);
      rim = Float32Array.from(rm);
      motes.length = 0;
      offset = new Float32Array(n * 2);
      velocity = new Float32Array(n * 2);
    };

    /** Moves the dots one step; returns how much motion is left, so the loop knows when to rest. */
    const step = () => {
      let energy = 0;
      const reach2 = REACH * REACH;
      for (let i = 0; i < n; i++) {
        const x = i * 2;
        const y = x + 1;
        if (pointerOn) {
          const dx = home[x] + offset[x] - pointerX;
          const dy = home[y] + offset[y] - pointerY;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / REACH) ** 2 * PUSH;
            velocity[x] += (dx / d) * f;
            velocity[y] += (dy / d) * f;
          }
        }
        velocity[x] = (velocity[x] - offset[x] * SPRING) * DAMPING;
        velocity[y] = (velocity[y] - offset[y] * SPRING) * DAMPING;
        offset[x] += velocity[x];
        offset[y] += velocity[y];
        energy += Math.abs(velocity[x]) + Math.abs(velocity[y]) + Math.abs(offset[x]) + Math.abs(offset[y]);
      }
      return energy;
    };

    const draw = () => {
      const d = Math.min(1, intro + scroll);
      ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
      ctx.fillStyle = COLOR;
      ctx.globalAlpha = 1 - d * 0.85;
      for (let i = 0; i < n; i++) {
        const x = i * 2;
        ctx.fillRect(
          home[x] + offset[x] + scatter[x] * d,
          home[x + 1] + offset[x + 1] + scatter[x + 1] * d,
          size[i],
          size[i],
        );
      }
      // Loose dots float above the portrait; they only exist once the portrait has gathered.
      if (motes.length && d < 0.5) {
        const now = performance.now() / 1000;
        for (let i = motes.length - 1; i >= 0; i--) {
          const m = motes[i];
          const age = (now - m.born) / MOTE_LIFE;
          if (age >= 1) {
            motes.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = (1 - age) * (1 - d * 2);
          ctx.fillRect(m.x + m.sway * age, m.y - MOTE_RISE * age * age - 18 * age, m.s, m.s);
        }
      }
    };

    const release = () => {
      if (dead || document.hidden || intro > 0 || scroll > 0.4 || motes.length >= MOTE_MAX || n === 0) return;
      const now = performance.now() / 1000;
      for (let k = 0; k < MOTE_BATCH; k++) {
        const i = (Math.random() * n) | 0;
        if (rim[i] < 0.55) continue;
        motes.push({
          x: home[i * 2] + offset[i * 2],
          y: home[i * 2 + 1] + offset[i * 2 + 1],
          s: size[i],
          born: now,
          sway: (Math.random() - 0.5) * 2 * MOTE_SWAY,
        });
      }
      schedule();
    };

    const tick = () => {
      raf = 0;
      if (dead) return;
      let again = false;
      if (intro > 0) {
        // Time-based, so the gather takes the same 1.4 s on any refresh rate.
        const t = Math.min(1, (performance.now() - started) / 1400);
        intro = t >= 1 ? 0 : (1 - t) ** 3;
        again = intro > 0;
      }
      if (!still && !calm && scroll < 1) again = step() > n * 0.02 || pointerOn || again;
      if (motes.length) again = true;
      draw();
      if (again) raf = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const span = Math.max(1, (hero?.offsetHeight ?? innerHeight) - innerHeight * 0.4);
      const e = Math.min(1, Math.max(0, scrollY / span));
      scroll = still || !scatterOnScroll ? 0 : e * e;
      schedule();
    };
    const onResize = () => {
      build();
      schedule();
    };
    // The art layer ignores pointer events (the hero's buttons sit above it), so the pointer is
    // tracked on the window and mapped into the canvas.
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = cv.getBoundingClientRect();
      pointerX = e.clientX - r.left;
      pointerY = e.clientY - r.top;
      pointerOn = pointerX >= 0 && pointerY >= 0 && pointerX <= r.width && pointerY <= r.height;
      if (pointerOn) schedule();
    };
    const onLeave = () => {
      pointerOn = false;
    };

    img.onload = () => {
      if (dead) return;
      build();
      started = performance.now();
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onResize);
      addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      if (!still && !calm) moteTimer = setInterval(release, MOTE_EVERY);
    };
    img.onerror = () => setFallback(true);
    img.src = SRC;

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      clearInterval(moteTimer);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [place, flip, scatterOnScroll]);

  return (
    <div className="hero-art" aria-hidden="true">
      <canvas ref={canvas} className="ink" />
      {fallback && <div className="ink-fallback" />}
    </div>
  );
}

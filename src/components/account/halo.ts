export type CheckStatus = "idle" | "verifying" | "success" | "error";

/** One dot of the mascot, in 0..1 coordinates. */
type Dot = { u: number; v: number; a: number };

export type Frame = {
  t: number;
  dt: number;
  status: CheckStatus;
  /** The visitor asked for less motion: draw the end state, no loops. */
  still: boolean;
  dots: Dot[];
  /** Per-canvas memory for smoothed values. */
  s: Record<string, number>;
};

/** White at rest, the page's blue while checking, green when verified, red when it failed. */
export const COLOR: Record<CheckStatus, string> = {
  idle: "#f2f4ff",
  verifying: "#3d6bff",
  success: "#4ade80",
  error: "#ff4d4d",
};

let cache: Promise<Dot[]> | null = null;

/** The mascot's alpha mask read once into dots. */
export function loadDots(): Promise<Dot[]> {
  cache ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const N = 44;
      const c = document.createElement("canvas");
      c.width = N;
      c.height = N;
      const x = c.getContext("2d", { willReadFrequently: true });
      if (!x) return resolve([]);
      x.drawImage(img, 0, 0, N, N);
      const data = x.getImageData(0, 0, N, N).data;
      const out: Dot[] = [];
      for (let r = 0; r < N; r++) {
        for (let q = 0; q < N; q++) {
          const a = data[(r * N + q) * 4 + 3] / 255;
          if (a >= 0.12) out.push({ u: (q + 0.5) / N, v: (r + 0.5) / N, a });
        }
      }
      resolve(out);
    };
    img.onerror = () => resolve([]);
    img.src = "/assets/vythea.png";
  });
  return cache;
}

/** Moves `s[key]` toward `target`; with reduced motion it jumps there. */
function ease(f: Frame, key: string, target: number, rate: number) {
  const now = f.s[key] ?? target;
  f.s[key] = f.still ? target : now + (target - now) * Math.min(1, f.dt * rate);
  return f.s[key];
}

/**
 * The halo check. The mascot and her ring take the colour of the status. A comet circles her head
 * while it checks; when it is verified the ring closes and glows; when it fails the ring breaks.
 */
export function drawHalo(ctx: CanvasRenderingContext2D, w: number, h: number, f: Frame) {
  const S = h;
  const ox = (w - S) / 2;
  const { t, status, dots, still } = f;
  const color = COLOR[status];

  const portrait = ease(f, "portrait", { idle: 0.45, verifying: 0.6, success: 0.9, error: 0.8 }[status], 5);
  const cell = S / 44;
  ctx.fillStyle = color;
  for (const d of dots) {
    ctx.globalAlpha = portrait * (0.5 + 0.5 * d.a);
    const size = Math.max(1, cell * 0.8 * Math.sqrt(d.a));
    ctx.fillRect(ox + d.u * S - size / 2, d.v * S - size / 2, size, size);
  }

  const cx = ox + 0.47 * S;
  const cy = 0.19 * S;
  const rx = 0.38 * S;
  const ry = 0.12 * S;
  const tilt = (8 * Math.PI) / 180;
  const ring = (a: number): [number, number] => {
    const ex = Math.cos(a) * rx;
    const ey = Math.sin(a) * ry;
    return [cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)];
  };

  const fill = ease(f, "fill", status === "success" ? 1 : 0, 3.2);
  const N = 96;
  ctx.fillStyle = color;
  for (let i = 0; i < N; i++) {
    if (status === "error" && i % 3 === 0) continue;
    const [x, y] = ring((i / N) * Math.PI * 2 - Math.PI / 2);
    const lit = i / N < fill;
    ctx.globalAlpha = lit ? 1 : status === "error" ? 0.55 : 0.3;
    const size = lit ? 2.4 : 1.7;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  if (status === "verifying") {
    const head = still ? 0 : t * 2.4;
    for (let k = 0; k < 22; k++) {
      const [x, y] = ring(head - k * 0.09);
      const size = 4.4 - k * 0.17;
      ctx.globalAlpha = 1 - k / 22;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }
  ctx.globalAlpha = 1;
}

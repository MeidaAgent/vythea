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

/** The halo: white at rest, the page's blue while checking, green when verified, red when it failed. */
export const COLOR: Record<CheckStatus, string> = {
  idle: "#f2f4ff",
  verifying: "#3d6bff",
  success: "#4ade80",
  error: "#ff4d4d",
};

let cache: Promise<Dot[]> | null = null;

/** Cells across the dot grid: the front-facing portrait needs more of them to keep her face. */
const GRID = 56;

/** The front-facing artwork (blue ink on white) read once into dots: the darker a spot, the stronger the dot. */
export function loadDots(): Promise<Dot[]> {
  cache ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const N = GRID;
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
          const at = (r * N + q) * 4;
          const lum = (0.299 * data[at] + 0.587 * data[at + 1] + 0.114 * data[at + 2]) / 255;
          const a = Math.min(1, (1 - lum) * (data[at + 3] / 255) * 1.5);
          const u = (q + 0.5) / N;
          const v = (r + 0.5) / N;
          if (a >= 0.15) out.push({ u, v, a });
          // Bare skin has no ink, so a faint fill over the face keeps it from reading as a hole.
          else if (((u - 0.5) / 0.16) ** 2 + ((v - 0.56) / 0.14) ** 2 <= 1) out.push({ u, v, a: 0.24 });
        }
      }
      resolve(out);
    };
    img.onerror = () => resolve([]);
    img.src = "/assets/vythea-front.png";
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
 * The halo check. She stays white; her ring takes the colour of the status. A comet circles her head
 * while it checks; when it is verified the ring closes and glows; when it fails the ring breaks.
 */
export function drawHalo(ctx: CanvasRenderingContext2D, w: number, h: number, f: Frame) {
  const S = h;
  const ox = (w - S) / 2;
  const { t, status, dots, still } = f;
  const color = COLOR[status];

  // She stays white whatever the status; only the halo changes colour.
  const cell = S / GRID;
  ctx.fillStyle = COLOR.idle;
  for (const d of dots) {
    ctx.globalAlpha = 0.9 * (0.5 + 0.5 * d.a);
    const size = Math.max(1, cell * 0.8 * Math.sqrt(d.a));
    ctx.fillRect(ox + d.u * S - size / 2, d.v * S - size / 2, size, size);
  }

  // The ring sits over the crown of her hair, centred, matching the halo lines of the artwork.
  const cx = ox + 0.5 * S;
  const cy = 0.17 * S;
  const rx = 0.42 * S;
  const ry = 0.11 * S;
  const tilt = (-3 * Math.PI) / 180;
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

const FALLBACK = "/dashboard/keys";

/** Only ever send people back to a page on this site, never to an address a link made up. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return FALLBACK;
  return next;
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** 1 234 567 -> "1.2M" */
export const fmtNum = (n: number) => compact.format(n);

/** Money with enough digits that a fraction of a cent still shows. */
export const fmtUsd = (n: number) => `$${Math.abs(n) >= 1 ? n.toFixed(2) : n.toFixed(4)}`;

export const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short" });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

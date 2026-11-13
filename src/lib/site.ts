export const SITE = {
  name: "Vythea",
  url: "https://vythea.com",
  title: "Vythea — Your agent, with its own cloud and wallet",
  description:
    "Vythea is an AI agent with its own cloud and wallet: it works on your computer and in your terminal with any model or account, hosts what it builds at a live link, and pays for the APIs it needs. macOS, Linux and Windows.",
  /** The VYTH contract address. `null` until the token is deployed; the chip then shows "not live". */
  contract: null as string | null,
} as const;

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "简体中文", short: "ZH" },
  { code: "ar", label: "العربية", short: "AR" },
  { code: "ja", label: "日本語", short: "JA" },
  { code: "ko", label: "한국어", short: "KO" },
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "es", label: "Español", short: "ES" },
  { code: "he", label: "עברית", short: "HE" },
  { code: "ru", label: "Русский", short: "RU" },
] as const;

export type Os = "mac" | "win" | "linux";

/** Same rule as the inline script in the root layout, which sets `html[data-os]` before first paint. */
export function detectOs(): Os {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = nav.userAgentData?.platform || navigator.platform || navigator.userAgent || "";
  if (/win/i.test(p)) return "win";
  if (/linux|x11|cros/i.test(p) && !/android/i.test(navigator.userAgent)) return "linux";
  return "mac";
}

export const OS_DETECT_SCRIPT = `!function(){var t=navigator.userAgentData&&navigator.userAgentData.platform||navigator.platform||navigator.userAgent||"";document.documentElement.dataset.os=/win/i.test(t)?"win":/linux|x11|cros/i.test(t)&&!/android/i.test(navigator.userAgent)?"linux":"mac"}()`;

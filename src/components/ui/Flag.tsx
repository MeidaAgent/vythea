import type { ReactNode } from "react";

/**
 * Small line-drawn flags in the site's single colour: shapes where a flag has an easy one, a letter of
 * the language's own script where it doesn't. They stand for the language, not the country.
 */
const MARKS: Record<string, ReactNode> = {
  // Union Jack, simplified: diagonals plus a cross.
  en: (
    <>
      <path d="M1 1l28 18M29 1L1 19" strokeWidth="1.2" />
      <path d="M15 1v18M1 10h28" strokeWidth="3.4" />
      <path d="M15 1v18M1 10h28" stroke="var(--blue)" strokeWidth="1.1" />
    </>
  ),
  // A large star and four small ones.
  zh: (
    <>
      <path
        d="M8 3.4l1.5 3.1 3.4.4-2.5 2.4.7 3.4L8 11l-3.1 1.7.7-3.4L3.1 6.9l3.4-.4z"
        fill="currentColor"
        stroke="none"
      />
      <g fill="currentColor" stroke="none">
        <circle cx="16" cy="4" r=".9" />
        <circle cx="18.5" cy="6.6" r=".9" />
        <circle cx="18.5" cy="10" r=".9" />
        <circle cx="16" cy="12.6" r=".9" />
      </g>
    </>
  ),
  // Lines of script.
  ar: <path d="M5 6h20M5 10h20M5 14h12" strokeWidth="1.4" />,
  // A single disc.
  ja: <circle cx="15" cy="10" r="4.6" fill="currentColor" stroke="none" />,
  // A disc and the corner bars.
  ko: (
    <>
      <circle cx="15" cy="10" r="3.8" />
      <path d="M15 6.2a3.8 3.8 0 0 1 0 7.6" fill="currentColor" stroke="none" />
      <path d="M4 4l3 2.4M26 4l-3 2.4M4 16l3-2.4M26 16l-3-2.4" strokeWidth="1.3" />
    </>
  ),
  // Three bands.
  de: (
    <>
      <path d="M1 7h28M1 13h28" strokeWidth="1" />
      <rect x="1" y="7" width="28" height="6" fill="currentColor" stroke="none" opacity=".55" />
    </>
  ),
};

const LETTERS: Record<string, string> = { es: "Ñ", he: "א", ru: "Я" };

export function Flag({ code, className = "flag" }: { code: string; className?: string }) {
  const letter = LETTERS[code];
  return (
    <svg
      viewBox="0 0 30 20"
      width={22}
      height={15}
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect x=".5" y=".5" width="29" height="19" strokeWidth="1" />
      {letter ? (
        <text
          x="15"
          y="14.4"
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
          stroke="none"
          fontFamily="var(--sans)"
        >
          {letter}
        </text>
      ) : (
        MARKS[code]
      )}
    </svg>
  );
}

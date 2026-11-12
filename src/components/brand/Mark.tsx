import { useId, type SVGProps } from "react";
import { OS_PATHS } from "@/lib/icon-paths";
import type { Os } from "@/lib/site";

type Props = SVGProps<SVGSVGElement>;

/**
 * The Vythea mark. The artwork is a white-on-black raster used as a luminance mask over a
 * `currentColor` fill, so the mark takes the text colour of wherever it sits.
 */
function MarkArt(props: Props) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <mask
        id={id}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="100"
        height="100"
        style={{ maskType: "luminance" }}
      >
        <image href="/assets/mark-mask.png" x="0" y="0" width="100" height="100" />
      </mask>
      <rect width="100" height="100" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}

/** The mark on its own (dock, loaders). */
export function Star(props: Props) {
  return <MarkArt width={20} height={20} {...props} />;
}

/** The mark as it sits beside the wordmark. */
export function Mark(props: Props) {
  return <MarkArt className="mark" width={16} height={16} {...props} />;
}

export function OsIcon({ os, ...props }: Props & { os: Os }) {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor" aria-hidden="true" {...props}>
      <path d={OS_PATHS[os]} />
    </svg>
  );
}

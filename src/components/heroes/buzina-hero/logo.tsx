import type { SVGProps } from "react";

/** Flared petal pointing up from the origin; rotated 4× to form the "x". */
const PETAL =
  "M0 -1.4C-1.2 -4.8 -5.6 -9.8 -4.6 -12.8C-3.6 -15.4 3.6 -15.4 4.6 -12.8C5.6 -9.8 1.2 -4.8 0 -1.4Z";

export function BuzinaMark({
  outline = false,
  ...props
}: SVGProps<SVGSVGElement> & { outline?: boolean }) {
  return (
    <svg viewBox="-16 -16 32 32" aria-hidden {...props}>
      {[45, 135, 225, 315].map((r) => (
        <path
          key={r}
          d={PETAL}
          transform={`rotate(${r})`}
          fill={outline ? "none" : "currentColor"}
          stroke={outline ? "currentColor" : "none"}
          strokeWidth={outline ? 0.9 : 0}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

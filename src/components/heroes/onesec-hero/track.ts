/**
 * The dashed network ring. A circle sized from the hero: it arcs from the
 * nav, down the right through the coins, under the card and behind it.
 */
export function ring(width: number, height: number) {
  return { cx: width * 0.525, cy: height * 0.46, r: height * 0.42 };
}

/** Where each coin sits on the ring (degrees, 0 = right, clockwise = down). */
export const COIN_ANGLES = [-50, -22.5, 5, 32.5, 60] as const;

/** Pixel position of a point on the ring. */
export function ringPoint(width: number, height: number, deg: number) {
  const { cx, cy, r } = ring(width, height);
  const a = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
}

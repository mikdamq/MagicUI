/**
 * An invisible circle, sized from the hero, that the coins rest along
 * (down the right side of the screen).
 */
export function ring(width: number, height: number) {
  return { cx: width * 0.525, cy: height * 0.46, r: height * 0.42 };
}

/** Where each coin sits on the circle (degrees, 0 = right, clockwise = down). */
export const COIN_ANGLES = [-50, -22.5, 5, 32.5, 60] as const;

/** Pixel position of a point on the circle. */
export function ringPoint(width: number, height: number, deg: number) {
  const { cx, cy, r } = ring(width, height);
  const a = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
}

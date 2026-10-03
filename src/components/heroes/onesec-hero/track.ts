import * as THREE from "three";

/**
 * The network route the coins glide along, as fractions of the hero size.
 * Starts by the nav, swoops through the top coin stack, around the right,
 * through the bottom stack, under the swap card, up behind it, and closes.
 */
const ROUTE: [number, number][] = [
  [0.6, 0.07],
  [0.745, 0.27], // top stack rests here
  [0.87, 0.5],
  [0.72, 0.745], // bottom stack rests here
  [0.5, 0.93],
  [0.22, 0.975],
  [0.035, 0.8],
  [0.1, 0.4],
  [0.3, 0.1],
];

/** Where each coin stack starts, as the route point index above. */
export const STACK_START = [1, 3] as const;

/** Seconds for one full lap. */
export const LAP = 70;

export function buildTrack(width: number, height: number) {
  const curve = new THREE.CatmullRomCurve3(
    ROUTE.map(([x, y]) => new THREE.Vector3(x * width, y * height, 0)),
    true,
    "centripetal",
  );
  // Arc-length position of each stack's resting point.
  const samples = 600;
  const starts = STACK_START.map((i) => {
    const target = new THREE.Vector3(ROUTE[i][0] * width, ROUTE[i][1] * height, 0);
    let best = 0;
    let bestD = Infinity;
    for (let s = 0; s < samples; s++) {
      const d = curve.getPointAt(s / samples).distanceToSquared(target);
      if (d < bestD) {
        bestD = d;
        best = s / samples;
      }
    }
    return best;
  });
  return { curve, starts };
}

/** SVG path data for the route, in pixels. */
export function trackPath(width: number, height: number) {
  const { curve } = buildTrack(width, height);
  const pts = curve.getSpacedPoints(240);
  return pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("") + "Z";
}

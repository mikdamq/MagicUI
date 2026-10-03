/**
 * Procedural mountain ridges in the 1440×945 design space.
 * Hand-placed key points give each range its silhouette; seeded midpoint
 * displacement adds the jagged detail. Deterministic, so SSR and client match.
 */

type Pt = [number, number];

function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function displace(points: Pt[], seed: number, rough: number, depth = 5): Pt[] {
  const rand = prng(seed);
  let pts = points;
  for (let level = 0; level < depth; level++) {
    const next: Pt[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      next.push(pts[i], [(x1 + x2) / 2, (y1 + y2) / 2 + (rand() - 0.5) * len * rough]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

const toPath = (pts: Pt[], bottom = 945) =>
  `M${pts[0][0]} ${bottom}` +
  pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join("") +
  `L${pts[pts.length - 1][0]} ${bottom}Z`;

export type Ridge = {
  id: string;
  path: string;
  top: string;
  bottom: string;
  depth: number;
  scroll: number;
  snow?: string;
};

const far = displace(
  [[-40, 700], [120, 668], [230, 650], [330, 628], [420, 655], [520, 640], [600, 612], [680, 640], [780, 650], [880, 628], [980, 655], [1080, 640], [1200, 662], [1320, 650], [1480, 690]],
  7, 0.32,
);

// The hero peak, with its snowy summit.
const peakKeys: Pt[] = [[260, 760], [380, 712], [470, 690], [540, 650], [592, 610], [622, 582], [650, 600], [700, 640], [760, 668], [830, 690], [900, 720], [980, 760]];
const peak = displace(peakKeys, 21, 0.22);
const snow = peak.filter(([x, y]) => x > 545 && x < 735 && y < 650);

const mid = displace(
  [[-40, 742], [80, 712], [180, 690], [250, 676], [320, 700], [400, 690], [470, 716], [560, 730], [660, 720], [760, 735], [860, 712], [940, 690], [1010, 668], [1070, 682], [1140, 700], [1240, 690], [1340, 712], [1480, 730]],
  42, 0.3,
);

const near = displace(
  [[-40, 790], [140, 770], [260, 752], [380, 760], [500, 742], [580, 716], [650, 712], [720, 730], [800, 744], [900, 738], [980, 722], [1060, 734], [1160, 748], [1300, 760], [1480, 780]],
  99, 0.26,
);

export const RIDGES: Ridge[] = [
  { id: "far", path: toPath(far), top: "#d3cee8", bottom: "#ebe8f5", depth: 4, scroll: -20 },
  {
    id: "peak",
    path: toPath(peak),
    top: "#b6aedb",
    bottom: "#e4e0f2",
    depth: 8,
    scroll: -40,
    snow: snow.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${(y + 1).toFixed(1)}`).join(""),
  },
  { id: "mid", path: toPath(mid), top: "#a69dd0", bottom: "#ddd8ef", depth: 14, scroll: -70 },
  { id: "near", path: toPath(near), top: "#8b81bd", bottom: "#d6d0ea", depth: 22, scroll: -110 },
];

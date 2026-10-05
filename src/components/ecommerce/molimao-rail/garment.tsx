/**
 * Hand-built vector garments on wooden hangers.
 * viewBox 0 0 200 300 — the hook tip sits at (112, 6); the rail touches y = 8.
 * Shading uses shared, colour-agnostic gradients/filters from <GarmentDefs />.
 */

export type Kind = "tee" | "hoodie";

export type Product = {
  id: string;
  name: string;
  kind: Kind;
  color: string;
  colorName: string;
  ink: string;
  price: number;
};

/** Render once per page: shared gradients and filters for every garment. */
export function GarmentDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <linearGradient id="mo-shade-x" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".2" />
          <stop offset=".18" stopColor="#000" stopOpacity=".04" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".7" stopColor="#000" stopOpacity=".02" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id="mo-shade-y" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".14" />
          <stop offset=".12" stopColor="#000" stopOpacity="0" />
          <stop offset=".85" stopColor="#000" stopOpacity=".03" />
          <stop offset="1" stopColor="#000" stopOpacity=".16" />
        </linearGradient>
        <linearGradient id="mo-wood" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d7a978" />
          <stop offset=".5" stopColor="#b98450" />
          <stop offset="1" stopColor="#8e5f35" />
        </linearGradient>
        <linearGradient id="mo-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#6d7076" />
          <stop offset=".5" stopColor="#c9ccd1" />
          <stop offset="1" stopColor="#7d8086" />
        </linearGradient>
        <filter id="mo-fabric" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n" />
          <feColorMatrix
            in="n"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"
            result="grain"
          />
          <feComposite in="grain" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="mo-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <filter id="mo-drop" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3a2a1a" floodOpacity=".18" />
        </filter>
      </defs>
    </svg>
  );
}

function Hanger() {
  return (
    <g>
      <path
        d="M100 40 L100 22 C100 10 111 4 116 10 C119 14 116 18 112 18"
        fill="none"
        stroke="url(#mo-metal)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M100 36 C80 38 40 54 18 64 C13 67 16 73 22 71 C45 64 80 49 100 47 C120 49 155 64 178 71 C184 73 187 67 182 64 C160 54 120 38 100 36Z"
        fill="url(#mo-wood)"
      />
      <path d="M24 66 C48 58 80 44 100 42 C120 44 152 58 176 66" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1" />
    </g>
  );
}

/* ---------------------------- T-shirt ----------------------------- */

const TEE_BODY =
  "M72 50 Q100 66 128 50 L170 64 L195 110 L163 125 L157 106 L159 250 Q100 256 41 250 L43 106 L37 125 L5 110 L30 64 Z";
const TEE_BODY_BACK =
  "M72 50 Q100 57 128 50 L170 64 L195 110 L163 125 L157 106 L159 250 Q100 256 41 250 L43 106 L37 125 L5 110 L30 64 Z";

function Tee({ color, ink, back }: { color: string; ink: string; back: boolean }) {
  const body = back ? TEE_BODY_BACK : TEE_BODY;
  return (
    <g>
      <path d={body} fill={color} />
      <path d={body} fill="url(#mo-shade-x)" />
      <path d={body} fill="url(#mo-shade-y)" />
      {/* folds */}
      <g filter="url(#mo-soft)" fill="none" strokeLinecap="round">
        <path d="M66 128 C72 170 64 208 70 246" stroke="#000" strokeOpacity=".09" strokeWidth="7" />
        <path d="M134 120 C128 168 138 206 132 246" stroke="#000" strokeOpacity=".08" strokeWidth="6" />
        <path d="M100 96 C104 150 96 200 102 246" stroke="#fff" strokeOpacity=".12" strokeWidth="9" />
        <path d="M18 104 C30 98 40 100 46 108" stroke="#000" strokeOpacity=".1" strokeWidth="5" />
        <path d="M182 104 C170 98 160 100 154 108" stroke="#000" strokeOpacity=".1" strokeWidth="5" />
      </g>
      {/* collar rib */}
      <path
        d={back ? "M73 52 Q100 60 127 52" : "M73 52 Q100 68 127 52"}
        fill="none"
        stroke="#000"
        strokeOpacity=".2"
        strokeWidth="5"
      />
      <path
        d={back ? "M75 55 Q100 63 125 55" : "M75 55 Q100 71 125 55"}
        fill="none"
        stroke="#fff"
        strokeOpacity=".18"
        strokeWidth="1"
      />
      {/* seams + stitching */}
      <g fill="none" stroke="#000" strokeOpacity=".16" strokeWidth="1">
        <path d="M43 106 L30 64" />
        <path d="M157 106 L170 64" />
        <path d="M9 104 L39 119" strokeDasharray="2 2" />
        <path d="M191 104 L161 119" strokeDasharray="2 2" />
        <path d="M43 242 Q100 248 157 242" strokeDasharray="2 2" />
      </g>
      <path d={body} fill="#fff" filter="url(#mo-fabric)" opacity=".9" />
      {back ? <BackPrint ink={ink} y={108} /> : <ChestPrint ink={ink} x={128} y={96} />}
    </g>
  );
}

/* ----------------------------- Hoodie ----------------------------- */

const HOODIE_BODY =
  "M68 54 Q100 62 132 54 L172 66 Q184 70 186 84 L192 228 L166 232 L160 120 L158 256 Q100 262 42 256 L40 120 L34 232 L8 228 L14 84 Q16 70 28 66 Z";

function Hoodie({ color, ink, back }: { color: string; ink: string; back: boolean }) {
  return (
    <g>
      {/* hood behind the neck (front view) */}
      {!back && <path d="M62 62 C56 30 144 30 138 62 Z" fill={color} />}
      {!back && <path d="M62 62 C56 30 144 30 138 62 Z" fill="#000" fillOpacity=".22" />}
      <path d={HOODIE_BODY} fill={color} />
      <path d={HOODIE_BODY} fill="url(#mo-shade-x)" />
      <path d={HOODIE_BODY} fill="url(#mo-shade-y)" />
      {/* sleeve separation shadows */}
      <g filter="url(#mo-soft)" fill="none">
        <path d="M40 122 L36 228" stroke="#000" strokeOpacity=".22" strokeWidth="6" />
        <path d="M160 122 L164 228" stroke="#000" strokeOpacity=".22" strokeWidth="6" />
        <path d="M100 100 C104 160 96 210 102 250" stroke="#fff" strokeOpacity=".12" strokeWidth="10" />
        <path d="M70 130 C76 180 66 220 72 252" stroke="#000" strokeOpacity=".08" strokeWidth="7" />
      </g>
      <g fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="1">
        <path d="M40 120 L36 232" />
        <path d="M160 120 L164 232" />
      </g>
      {/* cuffs + waistband rib */}
      <path d="M9 214 L34 218 L34 232 L8 228 Z" fill="#000" fillOpacity=".12" />
      <path d="M191 214 L166 218 L166 232 L192 228 Z" fill="#000" fillOpacity=".12" />
      <path d="M42 240 Q100 246 158 240 L158 256 Q100 262 42 256 Z" fill="#000" fillOpacity=".1" />
      <g stroke="#000" strokeOpacity=".08" strokeWidth="1">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={48 + i * 8} y1={243} x2={48 + i * 8} y2={257} />
        ))}
      </g>
      {back ? (
        <>
          {/* hood hanging down the back */}
          <path d="M64 58 C58 96 74 124 100 128 C126 124 142 96 136 58 Q100 66 64 58 Z" fill={color} />
          <path d="M64 58 C58 96 74 124 100 128 C126 124 142 96 136 58 Q100 66 64 58 Z" fill="#000" fillOpacity=".08" />
          <path d="M100 64 L100 127" stroke="#000" strokeOpacity=".18" strokeWidth="1" />
          <path d="M66 62 C62 96 76 120 100 124 C124 120 138 96 134 62" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="2" filter="url(#mo-soft)" />
          <BackPrint ink={ink} y={150} />
        </>
      ) : (
        <>
          {/* neck opening + drawstrings */}
          <path d="M80 56 Q100 86 120 56 Q100 66 80 56 Z" fill="#000" fillOpacity=".35" />
          <g stroke={ink} strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M92 74 C91 92 92 106 89 122" />
            <path d="M108 74 C109 92 108 106 111 122" />
          </g>
          <rect x="87" y="120" width="4" height="8" rx="1.5" fill={ink} fillOpacity=".8" />
          <rect x="109" y="120" width="4" height="8" rx="1.5" fill={ink} fillOpacity=".8" />
          {/* kangaroo pocket */}
          <path d="M62 184 L138 184 L150 232 L50 232 Z" fill="#000" fillOpacity=".04" />
          <path d="M62 184 L138 184 L150 232 M50 232 L62 184" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="1" strokeDasharray="2 2" />
          <ChestPrint ink={ink} x={100} y={150} center />
        </>
      )}
      <path d={HOODIE_BODY} fill="#fff" filter="url(#mo-fabric)" opacity=".9" />
    </g>
  );
}

/* ----------------------------- Prints ----------------------------- */

function Needle({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
      <ellipse cx="0" cy="-7" rx="1.4" ry="2.6" />
      <path d="M0 -3 L0 9" />
      <path d="M-0.9 -10 L0 -12 L0.9 -10" />
    </g>
  );
}

function ChestPrint({ ink, x, y, center }: { ink: string; x: number; y: number; center?: boolean }) {
  return (
    <g fill={ink}>
      <Needle x={center ? x - 30 : x - 15} y={y - 2} s={center ? 0.9 : 0.7} color={ink} />
      <text
        x={center ? x + 4 : x + 4}
        y={y + 2}
        textAnchor="middle"
        fontSize={center ? 11 : 7.5}
        fontWeight="700"
        letterSpacing={center ? 2.4 : 1.6}
        fontFamily="system-ui, sans-serif"
      >
        MOLIMAO
      </text>
    </g>
  );
}

function BackPrint({ ink, y }: { ink: string; y: number }) {
  return (
    <g fill={ink} fontFamily="system-ui, sans-serif" textAnchor="middle">
      <path id={`arc-${y}`} d={`M40 ${y + 10} Q100 ${y - 22} 160 ${y + 10}`} fill="none" />
      <text fontSize="6.6" letterSpacing="1">
        <textPath href={`#arc-${y}`} startOffset="50%">
          FROM SARAJEVO, WITH LOVE
        </textPath>
      </text>
      <Needle x={100} y={y + 22} s={1.2} color={ink} />
      <text x="100" y={y + 52} fontSize="18" fontWeight="800" letterSpacing="2.4">
        MOLIMAO
      </text>
      <text x="100" y={y + 66} fontSize="7" letterSpacing="2.6">
        SARAJEVO · BiH
      </text>
    </g>
  );
}

/* ----------------------------- Public ----------------------------- */

export function GarmentArt({ product, back = false }: { product: Product; back?: boolean }) {
  return (
    <svg viewBox="0 0 200 300" className="block h-full w-full overflow-visible" aria-hidden>
      {/* The hanger sits inside the garment: only the hook and shoulder tips show. */}
      <Hanger />
      <g filter="url(#mo-drop)">
        {product.kind === "tee" ? (
          <Tee color={product.color} ink={product.ink} back={back} />
        ) : (
          <Hoodie color={product.color} ink={product.ink} back={back} />
        )}
      </g>
    </svg>
  );
}

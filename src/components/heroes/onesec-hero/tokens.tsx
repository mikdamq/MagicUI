import { cn } from "@/lib/utils";

export type TokenId = "ETH" | "POL" | "USDC" | "USDT" | "ARB";

export type Token = {
  id: TokenId;
  name: string;
  chain: string;
  usd: number;
};

export const TOKENS: Record<TokenId, Token> = {
  ETH: { id: "ETH", name: "ETH", chain: "Polygon", usd: 3600 },
  POL: { id: "POL", name: "Polygon", chain: "Polygon", usd: 30 },
  USDC: { id: "USDC", name: "USDC", chain: "Arbitrum", usd: 1 },
  USDT: { id: "USDT", name: "USDT", chain: "Ethereum", usd: 1 },
  ARB: { id: "ARB", name: "Arbitrum", chain: "Arbitrum", usd: 0.75 },
};

export const TOKEN_ORDER: TokenId[] = ["ETH", "POL", "USDC", "USDT", "ARB"];

/* Simplified token marks — recognisable, not official artwork. */

function Mark({ id }: { id: TokenId }) {
  switch (id) {
    case "ETH":
      return (
        <>
          <defs>
            <linearGradient id="os-eth" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7d93f2" />
              <stop offset="1" stopColor="#5a6fe0" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="url(#os-eth)" />
          <path d="M20 6 L28.5 20.3 L20 25.3 L11.5 20.3 Z" fill="#fff" />
          <path d="M20 6 L20 25.3 L11.5 20.3 Z" fill="#e7ebff" />
          <path d="M20 27 L28.5 22 L20 34 L11.5 22 Z" fill="#fff" />
          <path d="M20 27 L20 34 L11.5 22 Z" fill="#e7ebff" />
        </>
      );
    case "POL":
      return (
        <>
          <circle cx="20" cy="20" r="20" fill="#8247e5" />
          <path
            d="M24.6 15.4 L28.4 17.6 V22.4 L24.6 24.6 L20.8 22.4 V17.6 M19.2 22.4 V17.6 L15.4 15.4 L11.6 17.6 V22.4 L15.4 24.6 L19.2 22.4"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      );
    case "USDC":
      return (
        <>
          <circle cx="20" cy="20" r="20" fill="#2775ca" />
          <path d="M14.5 9.8 A11.5 11.5 0 0 0 14.5 30.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M25.5 9.8 A11.5 11.5 0 0 1 25.5 30.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <text x="20" y="25.4" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
            $
          </text>
        </>
      );
    case "USDT":
      return (
        <>
          <circle cx="20" cy="20" r="20" fill="#26a17b" />
          <path d="M11 11.5 H29 V15.5 H22.2 V31 H17.8 V15.5 H11 Z" fill="#fff" />
          <ellipse cx="20" cy="19.6" rx="9.6" ry="2.6" fill="none" stroke="#fff" strokeWidth="1.6" />
        </>
      );
    case "ARB":
      return (
        <>
          <circle cx="20" cy="20" r="20" fill="#213147" />
          <path d="M20 8 L30.4 14 V26 L20 32 L9.6 26 V14 Z" fill="none" stroke="#28a0f0" strokeWidth="2" strokeLinejoin="round" />
          <path d="M17.4 27.6 L22.6 13.4 H25.2 L20 27.6 Z" fill="#fff" />
          <path d="M22.3 27.6 L25.5 19 L27 22.6 L25 27.6 Z" fill="#28a0f0" />
          <path d="M12.8 27.6 L18 13.4 H20.6 L15.4 27.6 Z" fill="#fff" />
        </>
      );
  }
}

export function TokenIcon({
  id,
  size = 59,
  badge = true,
  className,
}: {
  id: TokenId;
  size?: number;
  badge?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <Mark id={id} />
      </svg>
      {badge && (
        <span
          className="absolute -right-0.5 -bottom-0.5 grid place-items-center rounded-full bg-white ring-2 ring-white"
          style={{ width: size * 0.4, height: size * 0.4 }}
        >
          <svg viewBox="0 0 40 40" width={size * 0.34} height={size * 0.34} aria-hidden>
            <circle cx="20" cy="20" r="19" fill="#f3edff" />
            <path
              d="M24.6 15.4 L28.4 17.6 V22.4 L24.6 24.6 L20.8 22.4 V17.6 M19.2 22.4 V17.6 L15.4 15.4 L11.6 17.6 V22.4 L15.4 24.6 L19.2 22.4"
              fill="none"
              stroke="#8247e5"
              strokeWidth="2.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </span>
  );
}

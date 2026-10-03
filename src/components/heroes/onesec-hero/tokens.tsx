import { cn } from "@/lib/utils";
import { ICON_SVG, POLYGON_CHAIN_SVG } from "./logos";

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
      {/* Static, trusted SVG markup from logos.ts */}
      <span
        aria-hidden
        className="block size-full [&>svg]:size-full"
        dangerouslySetInnerHTML={{ __html: ICON_SVG[id] }}
      />
      {badge && (
        <span
          className="absolute -right-0.5 -bottom-0.5 grid place-items-center rounded-full bg-white ring-2 ring-white"
          style={{ width: size * 0.4, height: size * 0.4 }}
        >
          <span
            aria-hidden
            className="block [&>svg]:size-full"
            style={{ width: size * 0.3, height: size * 0.3 }}
            dangerouslySetInnerHTML={{ __html: POLYGON_CHAIN_SVG }}
          />
        </span>
      )}
    </span>
  );
}

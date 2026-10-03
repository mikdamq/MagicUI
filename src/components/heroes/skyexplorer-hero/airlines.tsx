/**
 * Partner row as styled text wordmarks — evocative of each airline,
 * no official logo artwork.
 */
export function Airlines() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-10 px-7 sm:px-0 gap-y-4 text-[#8d8b98] sm:gap-x-[70px]">
      <li className="flex items-center gap-1.5 opacity-60 transition-opacity hover:opacity-100">
        <svg viewBox="0 0 20 20" className="size-[17px]" aria-hidden>
          <circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 11.5 Q10 6 15 8.5 Q11 9 10 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span className="text-[17px] font-semibold tracking-[-0.02em]">Lufthansa</span>
      </li>
      <li className="opacity-60 transition-opacity hover:opacity-100">
        <span className="block -skew-x-[14deg] text-[25px] leading-none font-black tracking-[-0.06em] italic">
          LOT
        </span>
      </li>
      <li className="flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100">
        <svg viewBox="0 0 20 18" className="h-[15px]" aria-hidden>
          <path d="M10 0 L20 18 L10 13 L0 18 Z" fill="currentColor" />
        </svg>
        <span className="text-[18px] font-medium tracking-[0.32em]">DELTA</span>
      </li>
      <li className="flex flex-col items-center opacity-60 transition-opacity hover:opacity-100">
        <svg viewBox="0 0 24 10" className="mb-0.5 h-[9px]" aria-hidden>
          <circle cx="12" cy="2" r="1.6" fill="currentColor" />
          <circle cx="6" cy="5" r="1.4" fill="currentColor" />
          <circle cx="18" cy="5" r="1.4" fill="currentColor" />
          <rect x="4" y="7.5" width="16" height="2" rx="1" fill="currentColor" />
        </svg>
        <span className="text-[19px] leading-none font-extrabold tracking-[-0.02em]">KLM</span>
      </li>
      <li className="flex items-center gap-1.5 opacity-60 transition-opacity hover:opacity-100">
        <span className="text-[17px] font-semibold tracking-[0.3em]">UNITED</span>
        <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden>
          <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".6" />
          <path d="M3 7 H17 M2 10 H18 M3 13 H17" stroke="currentColor" strokeWidth="1" opacity=".5" />
        </svg>
      </li>
    </ul>
  );
}

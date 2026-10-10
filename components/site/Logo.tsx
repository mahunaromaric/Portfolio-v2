export function SillonMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true" focusable="false">
      <path
        d="M48 152 L120 152 A20 20 0 0 0 105.86 157.86 L165.86 97.86 A20 20 0 0 1 194.14 126.14 L134.14 186.14 A20 20 0 0 1 120 192 L48 192 A20 20 0 0 1 48 152 Z"
        fill="currentColor"
        className="text-accent"
      />
      <circle cx={214} cy={78} r={18} fill="currentColor" className="text-clay" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <SillonMark className="h-7 w-7" />
      <span className="hidden text-[15px] font-extrabold tracking-[-0.04em] text-ink min-[400px]:inline">Romaric GBENOU</span>
    </span>
  );
}

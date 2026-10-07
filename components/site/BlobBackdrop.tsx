export function BlobBackdrop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path
        d="M110 35 C 185 -5 295 10 340 75 C 385 140 370 260 310 320 C 250 385 140 410 65 335 C -5 260 15 105 110 35 Z"
        fill="var(--accent)"
        fillOpacity="0.07"
      />
      <path
        d="M110 35 C 185 -5 295 10 340 75 C 385 140 370 260 310 320 C 250 385 140 410 65 335 C -5 260 15 105 110 35 Z"
        stroke="var(--accent)"
        strokeOpacity="0.08"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="320" cy="85" r="2.5" fill="var(--accent)" opacity="0.18" />
      <circle cx="70" cy="310" r="2" fill="var(--accent)" opacity="0.14" />
    </svg>
  );
}

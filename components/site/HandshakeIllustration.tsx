export function HandshakeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full max-w-[340px] h-auto mx-auto text-ink ${className}`}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {/* Avant-bras gauche */}
      <path
        d="M 20 100 L 140 60"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Manchette gauche */}
      <path
        d="M 15 95 Q 5 95 5 85 L 5 75 Q 15 75 15 85"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Avant-bras droit */}
      <path
        d="M 300 100 L 180 60"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Manchette droite */}
      <path
        d="M 305 95 Q 315 95 315 85 L 315 75 Q 305 75 305 85"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Main du dessous (contour simple) */}
      <ellipse cx="160" cy="60" rx="38" ry="26" stroke="currentColor" strokeWidth="3" fill="none" />
      {/* Doigts (4 capsules parallèles) */}
      <path d="M 135 50 L 165 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M 135 56 L 170 56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M 135 62 L 175 62" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M 135 68 L 180 68" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Pouce de la main du dessus (accent unique) */}
      <path
        d="M 148 46 Q 158 38 172 48"
        stroke="var(--accentSolid)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

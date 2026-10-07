export function MethodeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-hidden="true">
      <rect x="20" y="36" width="360" height="2" rx="1" fill="var(--border)" />
      <circle cx="60" cy="37" r="20" fill="var(--accentSolid)" />
      <circle cx="200" cy="37" r="20" fill="var(--accentSolid)" />
      <circle cx="340" cy="37" r="20" fill="var(--accentSolid)" />
      <text x="60" y="42" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">01</text>
      <text x="200" y="42" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">02</text>
      <text x="340" y="42" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">03</text>
    </svg>
  );
}



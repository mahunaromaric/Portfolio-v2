"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useReducedMotion } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

/** Ancre fiable : scroll doux sur place, navigation + scroll différé sinon. */
export function AnchorLink({
  href,
  className,
  children,
  ariaLabel,
  onNavigate,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    // Nouvel onglet / molette / modificateurs : comportement navigateur natif.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;
    const path = href.slice(0, hashIndex);
    const hash = href.slice(hashIndex + 1);
    if (!hash) return;
    e.preventDefault();
    onNavigate?.();
    const behavior = reduce ? "auto" : "smooth";
    const scroll = () => document.getElementById(hash)?.scrollIntoView({ behavior, block: "start" });
    const here = (pathname || "/").replace(/\/$/, "") || "/";
    const there = (path || "/").replace(/\/$/, "") || "/";
    if (here === there) {
      if (href.includes("?")) router.replace(href, { scroll: false });
      scroll();
      return;
    }
    router.push(href, { scroll: false });
    const t0 = Date.now();
    const tick = () => {
      if (document.getElementById(hash)) scroll();
      else if (Date.now() - t0 < 2500) window.setTimeout(tick, 120);
    };
    window.setTimeout(tick, 150);
  };

  return (
    <a href={href} onClick={go} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

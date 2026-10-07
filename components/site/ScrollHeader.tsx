"use client";

import { useEffect, useState, type ReactNode } from "react";

export function ScrollHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-[background-color,box-shadow,border-color] duration-500 ${
        scrolled
          ? "border-border bg-bg/85 shadow-sm supports-[backdrop-filter]:backdrop-blur-md"
          : "border-transparent bg-bg/70 supports-[backdrop-filter]:backdrop-blur-sm"
      }`}
    >
      {children}
    </header>
  );
}

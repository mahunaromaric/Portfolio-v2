"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

/**
 * Thème clair par défaut, quel que soit le réglage du système.
 *
 * Le choix explicite de l'utilisateur (toggle) reste conservé dans
 * localStorage ; `next-themes` injecte le script d'initialisation avant le
 * premier paint pour éviter tout flash.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme };

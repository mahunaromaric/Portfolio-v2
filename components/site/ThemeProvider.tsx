"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null);

/**
 * Thème clair par défaut, quel que soit le réglage du système.
 *
 * Le premier rendu est toujours light (identique au SSR) pour éviter tout
 * mismatch d'hydratation. Après hydratation, le choix stocké dans
 * localStorage est appliqué, puis le toggle reste conservé pour les visites
 * suivantes.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored || "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
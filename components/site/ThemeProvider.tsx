"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void; resolvedTheme: "light" | "dark" } | null>(null);

export function ThemeProvider({ children, defaultTheme = "system", attribute = "class" }: { children: React.ReactNode; defaultTheme?: Theme; attribute?: string }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored || defaultTheme;
    setThemeState(initial);
  }, [defaultTheme]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const r = theme === "system" ? (mql.matches ? "dark" : "light") : (theme as "light" | "dark");
      setResolved(r);
      const root = document.documentElement;
      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(r);
      }
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [theme, attribute]);

  const setTheme = (t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: resolved }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

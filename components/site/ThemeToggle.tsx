"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8 rounded-full border border-border bg-surface" aria-hidden />;
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer en clair" : "Passer en sombre"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-ink hover:bg-bg transition"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

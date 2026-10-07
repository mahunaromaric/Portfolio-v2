"use client";

import { useEffect, useState } from "react";

const GREETINGS = [
  { text: "Bonjour", lang: "fr" },
  { text: "Hello", lang: "en" },
  { text: "Hola", lang: "es" },
  { text: "Ciao", lang: "it" },
  { text: "Hallo", lang: "de" },
  { text: "Olá", lang: "pt" },
] as const;

export function GreetingRotator({ name, locale }: { name: string; locale: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % GREETINGS.length), 2600);
    return () => clearInterval(id);
  }, [paused]);

  const current = GREETINGS[index]!;

  return (
    <span className="inline-flex items-baseline gap-1.5 min-h-[1.5em]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <span className="sr-only">{locale === "en" ? "Hello, I am" : "Bonjour, je suis"} {name}</span>
      <span aria-hidden="true" className="inline-flex items-baseline gap-1.5">
        <span className="relative inline-block min-w-[5.5ch] text-left overflow-hidden">
          <span key={current.text} lang={current.lang} className="inline-block animate-[fadeIn_0.35s_ease-out]">
            {current.text},
          </span>
        </span>
        <span>{locale === "en" ? "I am" : "je suis"}</span>
        <span className="font-extrabold text-ink">{name}</span>
      </span>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </span>
  );
}

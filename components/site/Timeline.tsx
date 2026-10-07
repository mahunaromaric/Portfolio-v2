"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GraduationCap } from "lucide-react";

export type TimelineItem = {
  id: string;
  badge: string | null;
  title: string;
  dates: string;
  description: string | null;
};

export type Diploma = {
  program: string;
  institution: string;
  years: string;
  label: string;
};

/** Timeline éditoriale : le filet se dessine au scroll, chaque pastille clay s'allume à l'apparition. */
export function Timeline({ items, diploma }: { items: TimelineItem[]; diploma: Diploma | null }) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = (vh * 0.6 - rect.top) / rect.height;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const markSeen = (id: string) =>
    setSeen((s) => {
      if (s.has(id)) return s;
      const next = new Set(s);
      next.add(id);
      return next;
    });

  return (
    <div>
      <div ref={trackRef} className="relative ml-4 border-l border-border pl-6 sm:ml-6 sm:pl-8">
        <div
          aria-hidden
          className="absolute bottom-0 left-[-1px] top-0 w-[2px] origin-top bg-accent"
          style={{ transform: `scaleY(${reduce ? 1 : progress})` }}
        />
        <div className="space-y-10">
          {items.map((item) => {
            const active = seen.has(item.id);
            return (
              <motion.div
                key={item.id}
                className="relative"
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                onViewportEnter={() => markSeen(item.id)}
              >
                <div
                  aria-hidden
                  className={`absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full transition-all duration-500 sm:-left-[39px] ${
                    active ? "scale-125 bg-clay shadow-[0_0_12px_rgba(194,65,12,0.6)]" : "bg-border"
                  }`}
                />
                <div className="space-y-2">
                  {item.badge && (
                    <span className="inline-block rounded-full bg-accentMuted px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
                      {item.badge}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                  <p className="text-xs font-medium tabular-nums text-secondary">{item.dates}</p>
                  {item.description && (
                    <p className="max-w-[640px] pt-1 text-sm leading-relaxed text-secondary">{item.description}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {diploma && (
        <motion.div
          className="mt-12 flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent/[0.04] p-6"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-accent">{diploma.label}</p>
            <h3 className="mt-1 text-base font-extrabold tracking-tight text-ink">{diploma.program}</h3>
            <p className="text-sm text-secondary">{diploma.institution}</p>
            <p className="mt-1 font-mono text-xs tabular-nums text-muted">{diploma.years}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

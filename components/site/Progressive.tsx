"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Révélation progressive mot à mot (masque + cascade), observateur natif. */
export function Words({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const words = text.split(" ");

  useEffect(() => {
    if (reduce || inView) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "-40px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, inView]);

  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
          style={i < words.length - 1 ? { marginRight: "0.25em" } : undefined}
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : {}}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

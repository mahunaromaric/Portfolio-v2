"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { HandshakeIllustration } from "./HandshakeIllustration";

export function ContactSection({ profile }: { profile: { contactEmail?: string | null } | null }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isEn = locale === "en";
  const reduce = useReducedMotion();
  const [view, setView] = useState<"presentation" | "form">("presentation");
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const email = profile?.contactEmail ?? "romamahuna@gmail.com";

  const channels = [
    { label: "Email", href: `mailto:${email}`, icon: <Mail aria-hidden /> },
    { label: "WhatsApp", href: "https://wa.me/2290161642237", icon: <Phone aria-hidden /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/romaric-gbenou", icon: <ArrowRight className="h-3 w-3" aria-hidden /> },
    { label: "GitHub", href: "https://github.com/mahunaromaric", icon: <ArrowRight className="h-3 w-3" aria-hidden /> },
  ] as const;

  useEffect(() => {
    if (view === "form") {
      const el = document.getElementById("cf-name");
      el?.focus();
    } else {
      openBtnRef.current?.focus();
    }
  }, [view]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && view === "form") setView("presentation");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  return (
    <section id="contact" className="pt-12 pb-6 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-10 overflow-hidden">
      <div className="mx-auto w-full max-w-[700px] px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[520px]">
          <AnimatePresence>
            {view === "presentation" && (
              <motion.div
                key="presentation"
                initial={{ opacity: 0, y: reduce ? 0 : -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : 8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className="text-center">
                  <div className="mb-8 flex items-center justify-center gap-2">
                    <span className="font-mono text-[11px] font-medium tabular-nums text-secondary">07</span>
                    <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-accent">{ "// Contact" }</span>
                    <span aria-hidden className="h-px flex-1 bg-border" />
                  </div>

                  <h1 className="mb-6 max-w-none text-[clamp(32px,8vw,56px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink text-balance">
                    {isEn ? "Let's talk about your project." : "Parlons de votre idée."}
                  </h1>

                  <p className="mx-auto mb-10 max-w-[520px] text-[16px] leading-[1.75] text-secondary dark:text-stone-400 sm:text-[17px]">
                    {t("intro")}
                  </p>

                  <button
                    ref={openBtnRef}
                    onClick={() => setView("form")}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[13px] font-bold text-white transition-[transform,background-color] duration-200 hover:bg-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {isEn ? "Write a message" : "Écrire un message"} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>

                  <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-secondary">
                    {channels.map((c) => (
                      <a
                        key={c.label}
                        href={c.href}
                        target={c.href.startsWith("mailto") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[12px] font-medium text-secondary hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {c.icon}
                        <span>{c.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: reduce ? 0 : -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : 8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className="max-w-[640px] mx-auto rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm dark:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                    <button
                      onClick={() => setView("presentation")}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-secondary transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("back")}
                    </button>
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">
                      {t("formTitle")}
                    </span>
                  </div>
                  <ContactForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="my-8 sm:my-12 flex justify-center" aria-hidden="true">
        <HandshakeIllustration />
      </div>
    </section>
  );
}

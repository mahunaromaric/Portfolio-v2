"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export function ContactSection({ profile }: { profile: { contactEmail?: string | null } | null }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isEn = locale === "en";
  const [view, setView] = useState<"intro" | "form">("intro");
  const email = profile?.contactEmail ?? "romamahuna@gmail.com";

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto w-full max-w-[700px] px-4 sm:px-6 lg:px-8 text-center">

        {/* En-tête sobre */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className="font-mono text-[11px] font-medium tabular-nums text-muted">07</span>
          <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-accent">{ "// Contact" }</span>
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>

        <h2 className="mb-4 max-w-none text-[clamp(28px,6vw,42px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink text-balance">
          {isEn ? "Let's talk about your project" : "Parlons de votre idée"}
        </h2>

        <p className="mb-8 max-w-none text-[14px] leading-[1.7] text-secondary dark:text-stone-400">
          {t("choose")} {t("response")} · Cotonou (GMT+1).
        </p>

        {/* Contact direct */}
        <a
          href={`mailto:${email}`}
          className="mb-10 inline-flex items-center justify-center gap-2 border border-border rounded-full px-6 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-secondary transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:hover:border-accent"
        >
          {t("name")} — {t("direct")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>

        <p className="mb-10 max-w-none text-[14px] leading-[1.7] text-secondary dark:text-stone-400">
          {isEn ? "One message is enough to start." : "Un message suffit pour commencer."}
        </p>

        {/* 3 étapes */}
        <ol className="mb-12 space-y-5 text-left sm:text-center">
          {[
            { n: "01", label: isEn ? "Context + goal in 3 lines" : "Contexte + objectif en 3 lignes" },
            { n: "02", label: t("response") },
            { n: "03", label: isEn ? "Clear quote, no jargon." : "Devis clair, sans jargon." },
          ].map((s) => (
            <li key={s.n} className="flex items-start gap-3">
              <span className="shrink-0 font-mono text-[11px] font-medium text-accent">{s.n}</span>
              <span className="text-[13px] text-secondary dark:text-stone-400">{s.label}</span>
            </li>
          ))}
        </ol>

        {/* Bouton qui révèle le formulaire */}
        <button
          onClick={() => setView("form")}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 border border-border rounded-full px-6 py-3 font-bold text-[13px] text-ink transition-colors duration-300 hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:text-stone-300 dark:hover:bg-stone-100 dark:hover:text-stone-950"
        >
          {t("formTitle")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>

      </div>

      {/* Formulaire révélé au clic (pas de card, même sobriété) */}
      {view === "form" && (
        <div className="mx-auto w-full max-w-[560px] px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("intro")}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-secondary transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-stone-400 dark:hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("back")}
            </button>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("formTitle")}</p>
            <span className="w-16" />
          </div>
          <ContactForm />
        </div>
      )}
    </section>
  );
}

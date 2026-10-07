"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Words } from "@/components/site/Progressive";
import Image from "next/image";

const WHATSAPP_NUMBER = "+2290161642237";

export function ContactSection({ profile }: { profile: { contactEmail?: string | null; name?: string | null } | null }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isEn = locale === "en";
  const [view, setView] = useState<"profile" | "form">("profile");

  return (
    <section id="contact" className="relative overflow-hidden rounded-[24px] border border-border bg-surface p-6 text-ink shadow-sm dark:border-white/10 dark:bg-[#0C0A09] dark:text-white dark:shadow-[0_32px_80px_-32px_rgba(0,0,0,0.6)] sm:p-10 lg:p-12">
      <span aria-hidden className="pointer-events-none absolute -top-8 right-6 select-none font-serif text-[120px] italic leading-none text-ink/[0.04] dark:text-white/[0.04] sm:text-[180px]">
        {isEn ? "talk" : "écrire"}
      </span>
      <span aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-clay/10 blur-[100px] dark:bg-clay/20" />

      <div className="relative mb-12 flex items-center gap-4 md:mb-16">
        <span className="font-mono text-xs font-medium tabular-nums text-muted">07</span>
        <span className="font-serif text-[22px] italic tracking-wide text-accent">{isEn ? "// contact" : "// contact"}</span>
        <span aria-hidden className="h-px flex-1 bg-border dark:bg-white/10" />
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surfaceSunken px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-secondary dark:border-white/10 dark:bg-white/5 dark:text-emerald-300 sm:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />{t("available")}
        </span>
      </div>

      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <h2 className="max-w-[420px] text-[clamp(30px,4.8vw,48px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-balance">
            <Words text={isEn ? "Let’s talk about your " : "Parlons de votre "} />
            <span className="font-serif font-normal italic text-clay"><Words text={isEn ? "idea." : "idée."} /></span>
          </h2>
          <p className="mt-4 max-w-[380px] text-[15px] leading-[1.7] text-secondary dark:text-stone-400">
            {t("choose")} {t("response")} · Cotonou (GMT+1).
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Image src="/img/avatar.png" alt="Romaric GBENOU" width={64} height={64} className="h-16 w-16 rounded-2xl border border-border object-cover dark:border-white/10" />
            <div>
              <p className="text-sm font-bold">{t("name")}</p>
              <p className="text-xs text-secondary dark:text-stone-400">{t("role")}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Cotonou → remote</p>
            </div>
          </div>

          <div className="mt-8 border-t border-border dark:border-white/10">
            {profile?.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="group flex items-center justify-between gap-4 border-b border-border py-5 transition-colors duration-300 hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:border-white/10 dark:hover:bg-white/[0.03]">
                <span className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surfaceSunken transition-colors duration-300 group-hover:border-clay group-hover:text-clay dark:border-white/10 dark:bg-white/5"><Mail className="h-4 w-4" aria-hidden /></span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Email — copier</span>
                    <span className="block truncate text-sm font-bold">{profile.contactEmail}</span>
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay" aria-hidden />
              </a>
            )}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 border-b border-border py-5 transition-colors duration-300 hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:border-white/10 dark:hover:bg-white/[0.03]">
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surfaceSunken transition-colors duration-300 group-hover:border-clay group-hover:text-clay dark:border-white/10 dark:bg-white/5"><Phone className="h-4 w-4" aria-hidden /></span>
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("whatsapp")} — urgent ?</span>
                  <span className="block text-sm font-bold">+229 01 61 64 22 37</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay" aria-hidden />
            </a>
            <button onClick={() => setView(view === "form" ? "profile" : "form")} className="group flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-300 hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:hover:bg-white/[0.03]" aria-expanded={view === "form"}>
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-white transition-colors duration-300 group-hover:bg-clayHover"><MessageCircle className="h-4 w-4" aria-hidden /></span>
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-clay">{t("form")} — 2 min</span>
                  <span className="block text-sm font-bold">{view === "form" ? t("back") : t("formTitle")}</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay" aria-hidden />
            </button>
          </div>

          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-[13px] font-bold text-clayHover transition-colors duration-300 hover:bg-clay/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:text-orange-200">
            <span>{isEn ? "Urgent project? WhatsApp fast-lane →" : "Projet urgent ? Fast-lane WhatsApp →"}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="rounded-[24px] border border-border bg-bg p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          {view === "profile" ? (
            <div className="flex h-full min-h-[320px] flex-col justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("direct")}</p>
                <p className="mt-3 font-serif text-[28px] italic leading-tight">
                  {isEn ? "One message is enough to start." : "Un message suffit pour commencer."}
                </p>
                <ul className="mt-6 space-y-3 text-[13px] text-secondary dark:text-stone-400">
                  <li className="flex gap-3"><span className="font-mono text-clay">01</span> Contexte + objectif en 3 lignes</li>
                  <li className="flex gap-3"><span className="font-mono text-clay">02</span> {t("response")}</li>
                  <li className="flex gap-3"><span className="font-mono text-clay">03</span> {isEn ? "Clear quote, no jargon." : "Devis clair, sans jargon."}</li>
                </ul>
              </div>
              <button onClick={() => setView("form")} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-bold text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:bg-white dark:text-stone-950 dark:hover:bg-orange-100">
                {t("formTitle")} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <button onClick={() => setView("profile")} className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary transition-colors duration-300 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:text-stone-400 dark:hover:text-white">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("back")}
                </button>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("formTitle")}</p>
                <span className="w-16" />
              </div>
              <ContactForm />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

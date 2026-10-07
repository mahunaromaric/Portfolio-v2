"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { submitContact } from "@/lib/actions/content";
import { Turnstile } from "./Turnstile";

const input =
  "w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-[14px] text-ink placeholder:text-muted transition-[border-color,box-shadow,background-color] duration-300 hover:border-borderStrong focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:hover:border-white/20";
const label = "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-secondary dark:text-stone-400";

/** Formulaire de contact public : honeypot + Turnstile + limite 1 msg/min/IP (serveur). */
export function ContactForm() {
  const t = useTranslations("contact");
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") ?? "";
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-4"
      noValidate={false}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (tokenRef.current) fd.set("turnstileToken", tokenRef.current);
        setPending(true);
        setStatus(null);
        submitContact(fd).then((res) => {
          setPending(false);
          if (res.error) {
            setStatus({ error: res.error });
            document.getElementById("contact-form-error")?.focus();
          } else if (res.waLink) window.location.href = res.waLink;
          else {
            setStatus({ ok: true });
            formRef.current?.reset();
          }
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="cf-name" className={label}>{t("yourName")}</label>
          <input id="cf-name" name="name" required minLength={2} autoComplete="name" placeholder="Ex. Aïcha M…" className={input} />
        </div>
        <div className="min-w-0">
          <label htmlFor="cf-email" className={label}>{t("yourEmail")}</label>
          <input id="cf-email" name="email" required type="email" autoComplete="email" spellCheck={false} placeholder="Ex. aicha@studio.co…" className={input} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="cf-phone" className={label}>{t("yourPhone")}</label>
          <input id="cf-phone" name="phone" required type="tel" autoComplete="tel" placeholder="Ex. +229 01…" className={input} />
        </div>
        <div className="min-w-0">
          <label htmlFor="cf-subject" className={label}>{t("subject")}</label>
          <input id="cf-subject" name="subject" defaultValue={initialSubject} autoComplete="off" placeholder="Ex. MVP SaaS…" className={input} />
        </div>
      </div>
      <div className="min-w-0">
        <label htmlFor="cf-content" className={label}>{t("yourMessage")}</label>
        <textarea id="cf-content" name="content" required minLength={10} rows={5} placeholder="Contexte, objectif, délai… (10 caractères min)…" className={`${input} min-h-[140px] resize-y`} />
      </div>
      {/* Honeypot anti-bot : invisible, doit rester vide */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Turnstile onToken={(tok) => (tokenRef.current = tok)} />
      <div aria-live="polite">
        {status?.error && <p id="contact-form-error" tabIndex={-1} className="text-[13px] text-clayHover focus:outline-none dark:text-orange-300">{status.error}</p>}
        {status?.ok && <p className="text-[13px] text-green-700 dark:text-emerald-300">{t("sent")}</p>}
      </div>
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <button
          disabled={pending}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-clay px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_12px_32px_rgba(194,65,12,0.25)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-clayHover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {pending ? t("sending") : t("send")} <ArrowUpRight className="h-4 w-4" aria-hidden />
        </button>
        <a
          href="https://wa.me/2290161642237"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-border px-6 py-3.5 text-[13px] font-bold text-ink transition-colors duration-300 hover:border-clay hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:border-white/15 dark:text-stone-200 dark:hover:border-clay dark:hover:text-white"
        >
          WhatsApp direct
        </a>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("response")}</p>
    </form>
  );
}

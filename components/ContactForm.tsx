"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Mail } from "lucide-react";
import { submitContact } from "@/lib/actions/content";
import { Turnstile } from "./Turnstile";

const input =
  "w-full rounded-2xl border border-border bg-bg px-4 py-3.5 text-[14px] text-ink placeholder:text-muted transition-[border-color,box-shadow,background-color] duration-200 hover:border-borderStrong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-stone-500 dark:hover:border-white/20";
const label = "mb-1 block font-mono text-[10px] font-medium tracking-[0.1em] text-secondary dark:text-stone-400";
const fieldHint = "mt-1 text-[10px] text-muted dark:text-stone-500";

/** Formulaire de contact public : honeypot + Turnstile + limite 1 msg/min/IP (serveur). */
export function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isEn = locale === "en";
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") ?? "";
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-5"
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
          <input
            id="cf-name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            placeholder="Ex. Aïcha M…"
            className={input}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="cf-email" className={label}>{t("yourEmail")}</label>
          <input
            id="cf-email"
            name="email"
            required
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="Ex. aicha@studio.co…"
            className={input}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="cf-phone" className={label}>
            {t("yourPhone")}
          </label>
          <span className={fieldHint}>{t("optional")}</span>
          <input id="cf-phone" name="phone" type="tel" autoComplete="tel" placeholder="Ex. +229 01…" className={input} />
        </div>
        <div className="min-w-0">
          <label htmlFor="cf-subject" className={label}>{t("subject")}</label>
          <span className={fieldHint}>{t("optional")}</span>
          <input id="cf-subject" name="subject" defaultValue={initialSubject} autoComplete="off" placeholder="Ex. MVP SaaS…" className={input} />
        </div>
      </div>
      <div className="min-w-0">
        <label htmlFor="cf-content" className={label}>{t("yourMessage")}</label>
        <textarea
          id="cf-content"
          name="content"
          required
          minLength={10}
          rows={5}
          placeholder="Contexte, objectif, délai… (10 caractères min)…"
          className={`${input} min-h-[140px] resize-y`}
        />
      </div>

      {/* Honeypot anti-bot : invisible, doit rester vide */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Turnstile onToken={(tok) => (tokenRef.current = tok)} />

      {status?.error && (
        <p id="contact-form-error" tabIndex={-1} className="mt-3 text-[11px] text-clayHover dark:text-orange-300">
          {status.error}
        </p>
      )}

      {status?.ok ? (
        <div className="pt-3 text-center">
          <p className="mb-4 text-[13px] text-secondary dark:text-stone-400">{t("sent")}</p>
          <button
            type="button"
            onClick={() => {
              setStatus(null);
              formRef.current?.reset();
            }}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-[13px] font-bold text-ink transition-colors duration-200 hover:text-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-stone-300 dark:hover:border-accent dark:hover:text-white"
          >
            {isEn ? "Send another message" : "Envoyer un autre message"}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <button
              disabled={pending}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[13px] font-bold text-white transition-[transform,background-color] duration-200 hover:bg-accentHover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {pending ? t("sending") : t("send")} <ArrowUpRight className="h-4 w-4" aria-hidden />
            </button>
            <a
              href="https://wa.me/2290161642237"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-full border border-border px-6 py-3.5 text-[13px] font-bold text-ink transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/15 dark:text-stone-200 dark:hover:border-accent dark:hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden /> WhatsApp
            </a>
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("response")}</p>
        </>
      )}
    </form>
  );
}

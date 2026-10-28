import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getProfile } from "@/lib/dal/public";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: locale === "en" ? "/en/mentions-legales" : "/mentions-legales",
      languages: { fr: "/mentions-legales", en: "/en/mentions-legales" },
    },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const profile = await getProfile().catch(() => null);
  const email = profile?.contactEmail ?? "romamahuna@gmail.com";

  const sections = [
    { title: t("publisherTitle"), body: t("publisherBody"), email: true },
    { title: t("hostTitle"), body: t("hostBody") },
    { title: t("ipTitle"), body: t("ipBody") },
    { title: t("dataTitle"), body: t("dataBody"), email: true },
    { title: t("cookiesTitle"), body: t("cookiesBody") },
  ];

  return (
    <article className="mx-auto w-full max-w-[900px] px-4 pb-28 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("eyebrow")}</p>
      <h1 className="mt-4 font-serif text-[clamp(44px,8vw,84px)] font-normal leading-[0.95] tracking-[-0.03em] text-ink">
        {t("title")}
      </h1>
      <p className="mt-5 max-w-[620px] text-[15px] leading-[1.75] text-secondary">{t("intro")}</p>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{t("updated")}</p>

      <div className="mt-12 border-t border-border dark:border-white/10">
        {sections.map((s, i) => (
          <section
            key={s.title}
            className="grid gap-3 border-b border-border py-8 dark:border-white/10 md:grid-cols-[220px_1fr] md:gap-10 md:py-10"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-ink">{s.title}</h2>
            </div>
            <div className="text-[14px] leading-[1.8] text-secondary">
              <p>{s.body}</p>
              {s.email && (
                <a
                  href={`mailto:${email}`}
                  className="mt-2 inline-flex min-h-[48px] items-center text-[14px] font-bold text-accent transition-colors duration-300 hover:text-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {email}
                </a>
              )}
            </div>
          </section>
        ))}
      </div>

      <Link
        href="/"
        className="group mt-10 inline-flex min-h-[48px] items-center gap-2 rounded-full border border-border px-5 py-3 text-[12px] font-bold text-ink transition-[border-color,color] duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
        {t("back")}
      </Link>
    </article>
  );
}

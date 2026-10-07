import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ContactSection } from "@/components/site/ContactSection";
import { TechMarquee } from "@/components/site/TechMarquee";
import { GreetingRotator } from "@/components/site/GreetingRotator";
import { MethodeIllustration } from "@/components/site/BentoIllustrations";
import { BlobBackdrop } from "@/components/site/BlobBackdrop";
import { Button, SectionHead } from "@/components/site/Section";
import { Words } from "@/components/site/Progressive";
import { AnchorLink } from "@/components/site/AnchorLink";
import { Reveal, Stagger } from "@/components/site/Reveal";
import { ServicesAccordion } from "@/components/site/ServicesAccordion";
import { ActivityCard, ActivitySkeleton, LanguagesCard, LanguagesSkeleton } from "@/components/site/GitHubCards";
import { Timeline } from "@/components/site/Timeline";
import { db } from "@/prisma/db";
import { getTranslations } from "next-intl/server";
import { getFeaturedProjects, getProfile, getPublishedEducations, getPublishedExperiences, getPublishedServices, getTechnologiesGrouped, getCollaborationPhases } from "@/lib/dal/public";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isEn = locale === "en";
  return {
    title: {
      absolute: isEn
        ? "Romaric GBENOU — Web Developer in Cotonou | React, Next.js, Laravel"
        : "Romaric GBENOU — Développeur Web à Cotonou | React, Next.js, Laravel",
    },
    description: t("hero.subtitle"),
    alternates: { canonical: isEn ? "/en" : "/", languages: { fr: "/", en: "/en" } },
  };
}

const PROJECT_EN: Record<string, { title: string; shortDescription: string }> = {
  "portfolio-v2": { title: "Portfolio V2", shortDescription: "A next-generation portfolio built with Next.js 16, Prisma 8 and an integrated back office." },
  "hemolink-xum15a": { title: "hemolink", shortDescription: "A fictional project created for a challenge focused on blood donation in Benin." },
};

const SERVICE_EN: Record<string, { title: string; description: string }> = {
  "Développement Fullstack": { title: "Fullstack development", description: "Complete web applications, from frontend to API, ready for production." },
  "Développement Mobile": { title: "Mobile development", description: "Performant iOS/Android apps with a native experience." },
  "API & Backend": { title: "API & Backend", description: "Robust APIs, authentication, payments and integrations." },
  "Sites & Landing Pages": { title: "Websites & Landing Pages", description: "Fast showcase websites focused on SEO and conversion." },
  "Architecture & Systèmes": { title: "Architecture & Systems", description: "Scalable design, databases and infrastructure." },
  "Outils & Packages Open Source": { title: "Open Source Tools & Packages", description: "Reusable libraries and tailor-made automations." },
  "Tunnel de vente": { title: "Sales funnel", description: "Tailor-made sales funnels designed to help you sell more effectively." },
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isEn = locale === "en";
  const [profile, featured, experiences, educations, techs, servicesRaw, phasesRaw] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getPublishedExperiences(),
    getPublishedEducations(),
    getTechnologiesGrouped(),
    getPublishedServices(),
    getCollaborationPhases(locale),
  ]);
  const services = (servicesRaw as unknown as { title: string; titleEn?: string | null; description?: string | null; descriptionEn?: string | null }[]).map((s) => {
    const fallback = SERVICE_EN[s.title];
    return isEn
      ? { ...s, title: s.titleEn || fallback?.title || s.title, description: s.descriptionEn || fallback?.description || s.description }
      : s;
  }) as typeof servicesRaw;
  const localizedExperiences = isEn
    ? experiences.map((e) => ({ ...e, company: e.companyEn || e.company, role: e.roleEn || e.role, description: e.descriptionEn || e.description }))
    : experiences;
  const localizedEducations = isEn
    ? educations.map((e) => ({ ...e, institution: e.institutionEn || e.institution, program: e.programEn || e.program, description: e.descriptionEn || e.description }))
    : educations;
  const phases = (phasesRaw as unknown as { titleEn?: string | null; descriptionEn?: string | null }[]).map((p: unknown) =>
    isEn && (p as { titleEn?: string | null }).titleEn
      ? { ...(p as object), title: (p as { titleEn: string }).titleEn, description: (p as { descriptionEn?: string | null }).descriptionEn || (p as { description: string }).description }
      : (p as object),
  ) as typeof phasesRaw;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahuna.is-a.dev";
  const projects = featured.slice(0, 6);
  const enriched = await Promise.all(
    projects.map(async (p) => {
      const mediaLinks = await db.orm.public.ProjectMedia.where((m) => m.projectId.eq(p.id)).orderBy((m) => m.displayOrder.asc()).all();
      const coverLink = mediaLinks.find((m) => m.isCover) ?? mediaLinks[0];
      const cover = coverLink ? await db.orm.public.Media.where((m) => m.id.eq(coverLink.mediaId)).first() : null;
      const techLinks = await db.orm.public.ProjectTechnology.where((t) => t.projectId.eq(p.id)).orderBy((t) => t.displayOrder.asc()).limit(3).all();
      const techNames = (
        await Promise.all(techLinks.map((l) => db.orm.public.Technology.where((t) => t.id.eq(l.technologyId)).first()))
      )
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .map((t) => t.name);
      const translated = isEn ? PROJECT_EN[p.slug] : undefined;
      return { p: isEn ? { ...p, title: p.titleEn || translated?.title || p.title, shortDescription: p.shortDescriptionEn || translated?.shortDescription || p.shortDescription, role: p.roleEn || p.role } : p, cover, techNames };
    }),
  );

  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { month: "short", year: "numeric" });
  const timelineItems = localizedExperiences.slice(0, 4).map((e) => ({
    id: e.id,
    badge: /stage/i.test(e.role)
      ? isEn ? "Internship" : "Stage"
      : /challenge|figma/i.test(`${e.company} ${e.role}`)
        ? "Challenge"
        : null,
    title: `${e.role} — ${e.company}`,
    dates: `${fmtDay(e.startDate)} → ${e.endDate ? fmtDay(e.endDate) : isEn ? "Present" : "Présent"}`,
    description: e.description,
  }));
  const diploma = localizedEducations.slice(0, 1).map((ed) => ({
    program: ed.program,
    institution: ed.institution,
    years: `${ed.startDate.slice(0, 4)} → ${ed.endDate ? ed.endDate.slice(0, 4) : isEn ? "Present" : "Présent"}`,
    label: isEn ? "Education" : "Formation",
  }))[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 pt-12 md:pt-16 space-y-16 md:space-y-28 pb-16">
      {/* Hero */}
      <section id="hero" className="pt-6 sm:pt-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Stagger className="flex-1 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surfaceSunken/90 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isEn ? profile?.availabilityLabelEn || t("hero.available") : profile?.availabilityLabel ?? t("hero.available")}
              <span aria-hidden className="text-muted">·</span>
              <span>Cotonou, BJ</span>
            </div>
            <p className="text-sm font-medium tracking-wide text-secondary">
              <GreetingRotator name={profile?.name ?? "Romaric GBENOU"} locale={locale} />
            </p>
            <h1 className="max-w-[680px] text-[clamp(42px,6.2vw,72px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink text-balance">
              <Words text={t("hero.title1")} /> <br />
              <span className="font-serif italic font-normal tracking-normal text-accent"><Words text={t("hero.title2")} /></span>{" "}
              <span className="font-sig inline-block -rotate-4 align-baseline text-[0.55em] font-normal tracking-normal text-clay">{isEn ? "available" : "disponible"}</span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-secondary break-words" lang={locale}>
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <Link href="/work" className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brandDark px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(28,25,23,0.18)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_12px_32px_rgba(28,25,23,0.22)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                {t("hero.cta1")} <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface/15 transition group-hover:bg-surface/20"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" /></span>
              </Link>
              <AnchorLink href="/#contact" className="inline-flex items-center gap-1.5 px-2 py-3 text-[13px] font-bold text-ink underline decoration-borderStrong underline-offset-8 transition-colors duration-300 hover:text-clay hover:decoration-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {t("hero.cta2")} <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </AnchorLink>
            </div>
            <div className="hidden pt-3 sm:block">
              <TechMarquee technologies={[...techs.grouped.flatMap((g) => g.technologies), ...techs.uncategorized]} compact />
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">stack principale →</p>
            </div>
          </Stagger>
          <Reveal delay={0.2} className="relative w-full max-w-[420px] shrink-0 justify-self-center lg:justify-self-end">
            <figure className="relative">
              <div aria-hidden className="absolute -inset-6 -z-10 scale-90">
                <BlobBackdrop className="h-full w-full" />
              </div>
              <span aria-hidden className="absolute -right-3 -top-3 z-10 h-6 w-6 rounded-full border-2 border-bg bg-clay" />
              {profile?.avatarUrl ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-borderStrong bg-surface shadow-[0_24px_60px_-20px_rgba(28,25,23,0.3)] ring-1 ring-white/10">
                  <Image src={profile.avatarUrl} alt={profile.name ?? "Portrait"} fill priority className="object-cover" sizes="420px" />
                </div>
              ) : (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-borderStrong bg-surface shadow-[0_24px_60px_-20px_rgba(28,25,23,0.3)] ring-1 ring-white/10">
                  <Image src="/img/heroIllustration.png" alt="Illustration — développeur au travail" fill className="object-contain p-4" sizes="420px" priority />
                </div>
              )}
              <figcaption className="mt-3 flex items-center justify-end font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                <span>Cotonou → remote</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* About */}
      <Reveal>
      <section id="about" className="space-y-6">
        <SectionHead index="01" label={t("about.label")} title={t("about.title")} intro={t("about.intro")} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-2 gap-x-6 gap-y-4 md:order-1">
            <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-48">
              <div className="h-20 bg-bg border-b border-border flex items-center justify-center p-2">
                <MethodeIllustration className="w-full h-full" />
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <span className="text-xs font-bold tracking-widest text-accent uppercase">{t("about.approach")}</span>
                <p className="text-xs font-medium leading-tight text-ink">{t("about.approachText")}</p>
                <span className="text-[11px] text-muted">Product Builder</span>
              </div>
            </div>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-48">
              <div className="relative h-28 overflow-hidden border-b border-border bg-bg">
                <Image src="/img/ama.png" alt="Cotonou, Bénin — ama" fill className="object-cover" sizes="300px" quality={90} />
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <span className="text-xs font-bold text-ink">{t("about.base")}</span>
                <p className="text-xs text-secondary font-medium leading-tight">{t("about.baseText")}</p>
                <span className="text-[10px] text-muted font-mono">Cotonou, Bénin</span>
              </div>
            </div>
            <div className="col-span-2 bg-surface/60 backdrop-blur-xl backdrop-saturate-150 border border-white/40 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden shadow-sm supports-[backdrop-filter]:bg-surface/50">
              <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                <Image src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop" alt="" fill className="object-cover opacity-20 blur-[18px] scale-110" sizes="600px" />
                <div className="absolute inset-0 bg-gradient-to-br from-surface/30 via-transparent to-accentMuted" />
              </div>
              <div className="relative flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1.5 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn.simpleicons.org/n8n/EA4B71" alt="n8n" crossOrigin="anonymous" width={16} height={16} className="h-4 w-4" /><span className="text-xs font-bold text-ink">n8n</span></span>
                <span className="text-muted">·</span>
                <span className="flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1.5 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg" alt="IA" crossOrigin="anonymous" width={16} height={16} className="h-4 w-4" /><span className="text-xs font-bold text-ink">IA</span></span>
              </div>
              <p className="relative mt-3 text-xs font-bold tracking-wide text-ink">{t("about.automation")}</p>
              <p className="relative text-xs text-secondary">{t("about.exploration")}</p>
            </div>
          </div>
          <div className="md:col-span-1 md:order-2 relative min-h-[420px] md:min-h-[480px] md:h-full">
            <div aria-hidden className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-surfaceSunken">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="aboutDots" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" className="text-borderStrong" fill="currentColor" opacity="0.55" />
                  </pattern>
                </defs>
                <rect width="400" height="560" fill="url(#aboutDots)" />
                <path d="M48 560 V250 A152 152 0 0 1 352 250 V560 Z" className="text-accentMuted" fill="currentColor" />
                <circle cx="330" cy="86" r="14" className="text-clay" fill="currentColor" />
                <g transform="translate(52,64) scale(0.28)" className="text-accent" stroke="currentColor" fill="none" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M48 172 H120 L180 112" />
                </g>
                <circle cx="102" cy="82" r="18" className="text-clay" fill="currentColor" />
              </svg>
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-clay/10 blur-[80px]" />
            </div>
            <figure className="absolute inset-x-5 top-5 bottom-5 rotate-[-1.5deg] overflow-hidden rounded-[28px] border border-borderStrong bg-brandDark shadow-[0_24px_60px_-20px_rgba(28,25,23,0.35)]">
              {profile?.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.name ?? "Portrait"} fill className="object-cover object-top" sizes="(max-width:768px) 100vw, 420px" quality={90} />
              ) : (
                <Image src="/img/portrait.png" alt="Portrait — Romaric GBENOU" fill className="object-cover object-top" sizes="(max-width:768px) 100vw, 420px" quality={90} />
              )}
            </figure>
          </div>
        </div>
      </section>
      </Reveal>

      {/* Projects */}
      <Reveal>
      <section id="projects" className="space-y-6">
        <SectionHead index="02" label={t("projects.label")} title={t("projects.title")} intro={t("projects.intro")} />
        <div className="space-y-8">
          {enriched.length === 0 ? (
            <p className="text-sm text-secondary">{t("projects.noProjects")}</p>
          ) : (
            enriched.map((item, idx) => {
              const { p, techNames } = item;
              const isWide = idx % 3 === 0;
              if (isWide) {
                return (
                  <article key={p.id} className="group overflow-hidden rounded-[24px] border border-border bg-surface shadow-sm transition-[box-shadow,border-color] duration-500 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_rgba(30,58,138,0.25)]">
                    <div className="grid grid-cols-1 items-center md:grid-cols-2">
                      <div className="space-y-4 p-6 sm:p-8">
                        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{[(isEn ? p.category.nameEn || p.category.name : p.category.name), p.year].filter(Boolean).join(" · ") || "Projet"}</p>
                        <h3 className="text-[20px] font-extrabold tracking-tight text-ink text-balance transition-colors duration-300 group-hover:text-accent">{p.title}</h3>
                        <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-3 break-words">{p.shortDescription}</p>
                        <div className="flex flex-wrap gap-1.5">{techNames.map((t) => <span key={t} className="rounded border border-border bg-surfaceSunken px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-secondary">{t}</span>)}</div>
                        <div className="pt-2">
                          <Link href={`/work/${p.slug}`} aria-label={t("projects.viewProject", { title: p.title })} className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink transition-[background-color,border-color,color,transform] duration-300 hover:border-ink hover:bg-ink hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" /></Link>
                        </div>
                      </div>
                      <div className="relative min-h-[240px] overflow-hidden border-t border-border bg-surfaceSunken md:min-h-[240px] md:border-l md:border-t-0">
                        {item.cover ? (
                          <Image src={item.cover.url} alt={item.cover.alt || p.title} fill className="object-cover transition-transform duration-[900ms] ease-out motion-reduce:transition-none group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 50vw" />
                        ) : (
                          <div className="flex h-full min-h-[240px] w-full items-center justify-center border border-dashed border-borderStrong bg-gradient-to-br from-surfaceSunken to-border text-xs text-muted">{t("projects.noImage")} — bientôt…</div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              }
              // Duo items are rendered as single card; grouping handled by outer space-y-8 with duo pairs wrapped in grid below via index logic
              return null;
            })
          )}
          {/* Duo grid for non-wide projects */}
          {enriched.filter((_, i) => i % 3 !== 0).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enriched
                .filter((_, i) => i % 3 !== 0)
                .map(({ p, techNames, cover }) => (
                  <article key={p.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-surface shadow-sm transition-[box-shadow,border-color] duration-500 hover:border-accent/40 hover:shadow-[0_20px_60px_-20px_rgba(30,58,138,0.25)]">
                    <div className="relative h-52 overflow-hidden bg-surfaceSunken">
                      {cover ? (
                        <Image src={cover.url} alt={cover.alt || p.title} fill className="object-cover transition-transform duration-[900ms] ease-out motion-reduce:transition-none group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 50vw" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center border border-dashed border-borderStrong bg-gradient-to-br from-surfaceSunken to-border text-xs text-muted">{t("projects.noImage")} — bientôt…</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between space-y-3 p-6">
                      <div>
                        <h3 className="line-clamp-2 text-base font-extrabold tracking-tight text-ink text-balance transition-colors duration-300 group-hover:text-accent">{p.title}</h3>
                        <p className="mt-1 line-clamp-3 text-xs text-secondary break-words">{p.shortDescription}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">{techNames.slice(0, 2).map((t) => <span key={t} className="rounded border border-border bg-surfaceSunken px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-secondary">{t}</span>)}</div>
                        <Link href={`/work/${p.slug}`} aria-label={t("projects.viewProject", { title: p.title })} className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink transition-[background-color,border-color,color,transform] duration-300 hover:border-ink hover:bg-ink hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" /></Link>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
        <div className="pt-2">
          <Button href="/work" variant="secondary">{t("projects.viewAll")}</Button>
        </div>
      </section>
      </Reveal>

      {/* Stack & Experience */}
      <Reveal>
      <section id="experience" className="space-y-10">
        <SectionHead index="03" label={t("experience.label")} title={t("experience.title")} intro={t("experience.intro")} />
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<LanguagesSkeleton />}>
            <LanguagesCard isEn={isEn} title={t("experience.languagesTitle")} />
          </Suspense>
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivityCard
              isEn={isEn}
              labels={{
                title: t("experience.githubTitle"),
                commits: t("experience.commits"),
                prs: t("experience.prs"),
                activeDays: t("experience.activeDays"),
              }}
            />
          </Suspense>
        </div>
        <Timeline items={timelineItems} diploma={diploma} />
      </section>
      </Reveal>

      {/* Services */}
      <Reveal>
      <section id="services" className="space-y-6">
        <SectionHead index="04" label={t("services.label")} title={t("services.title")} intro={t("services.intro")} />
        <ServicesAccordion services={services} locale={locale} />
      </section>
      </Reveal>

      {/* Collaboration */}
      <Reveal>
      <section id="collaboration" className="pt-12 md:pt-16">
        <div className="max-w-[1280px] mx-auto space-y-10">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-medium tabular-nums text-muted">05</span>
                <span className="font-serif italic font-normal text-[22px] tracking-wide text-accent">{t("collaboration.label")}</span>
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mt-5 max-w-[760px] text-[clamp(30px,4.8vw,48px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink text-balance"><Words text={t("collaboration.title")} /></h2>
              <p className="mt-4 max-w-sm text-[15px] leading-[1.7] text-secondary">{t("collaboration.intro")}</p>
            </div>
            <AnchorLink href="/#contact" className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-brandDark px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(28,25,23,0.18)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_12px_32px_rgba(28,25,23,0.22)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              {t("collaboration.cta")} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </AnchorLink>
          </div>

          <ol className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4" aria-label={locale === "en" ? "Collaboration steps" : "Étapes de collaboration"}>
            <div aria-hidden className="absolute left-5 top-2 bottom-2 w-px bg-border sm:hidden" />
            <div aria-hidden className="hidden sm:block absolute top-6 left-[15%] right-[15%] h-px bg-border" />
            {phases.map((phase) => (
              <li key={phase.id} className="relative flex gap-4 sm:flex-col sm:items-center sm:text-center sm:gap-0 flex-1">
                <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 bg-surface grid place-items-center text-sm font-bold tabular-nums text-accent border-accent sm:mx-auto">
                  <span aria-hidden>{String(phase.number).padStart(2, "0")}</span>
                  <span className="sr-only">{locale === "en" ? `Step ${phase.number} of ${phases.length}` : `Étape ${phase.number} sur ${phases.length}`}</span>
                </div>
                <div className="sm:mt-3">
                  <h3 className="text-sm font-bold text-ink sm:text-xs sm:uppercase sm:tracking-widest">{phase.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-secondary sm:text-xs sm:max-w-[180px] sm:mx-auto">{phase.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      </Reveal>

      {/* FAQ */}
      <Reveal>
      <section id="faq" className="space-y-6">
        <SectionHead index="06" label={t("faq.label")} title={t("faq.title")} />
        <div className="divide-y divide-border border-y border-border">
          {[1, 2, 3, 4].map((n) => (
            <details key={n} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                <span>{t(`faq.q${n}`)}</span>
                <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-lg font-light text-muted transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 max-w-[640px] text-sm leading-relaxed text-secondary">{t(`faq.a${n}`)}</p>
            </details>
          ))}
        </div>
      </section>
      </Reveal>

      {/* Contact */}
      <Reveal>
      <Suspense>
      <ContactSection profile={profile} />
      </Suspense>
      </Reveal>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                name: profile?.name || "Romaric GBENOU",
                jobTitle: profile?.headline || "Product Builder",
                url: siteUrl,
                address: { "@type": "PostalAddress", addressLocality: profile?.location || "Cotonou", addressCountry: "BJ" },
                sameAs: (profile?.socialLinks || []).map((s: { url: string }) => s.url).filter(Boolean),
              },
              {
                "@type": "WebSite",
                name: "Romaric GBENOU — Product Builder",
                url: siteUrl,
                inLanguage: "fr-FR",
              },
              {
                "@type": "ProfessionalService",
                name: "Romaric GBENOU — Product Builder",
                url: siteUrl,
                address: { "@type": "PostalAddress", addressLocality: profile?.location || "Cotonou", addressCountry: "BJ" },
                knowsAbout: ["React", "Next.js", "Laravel", "PostgreSQL", "Node.js"],
                sameAs: (profile?.socialLinks || []).map((s: { url: string }) => s.url).filter(Boolean),
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [1, 2, 3, 4].map((n) => ({
              "@type": "Question",
              name: t(`faq.q${n}`),
              acceptedAnswer: { "@type": "Answer", text: t(`faq.a${n}`) },
            })),
          }),
        }}
      />
    </div>
  );
}

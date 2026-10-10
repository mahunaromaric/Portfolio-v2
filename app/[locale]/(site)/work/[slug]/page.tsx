import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/prisma/db";
import { routing } from "@/i18n/routing";
import { getProjectBySlug, getPublishedProjects } from "@/lib/dal/public";
import { CaseStudyRenderer, type CaseBlock } from "@/components/site/CaseStudyRenderer";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;
const W = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8";
export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params; const project = await getProjectBySlug(slug); const t = await getTranslations({ locale, namespace: "workDetail" }); if (!project) return { title: t("notFound") };
  const cover = project.media.find((m) => m.link.isCover)?.media ?? project.media[0]?.media ?? null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahuna.is-a.dev";
  const url = `${siteUrl}/work/${slug}`;
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: {
      canonical: `${locale === "en" ? "/en" : ""}/work/${slug}`,
      languages: { fr: `/work/${slug}`, en: `/en/work/${slug}` },
    },
    openGraph: { title: project.title, description: project.shortDescription, type: "article", url, images: cover ? [{ url: cover.url, width: 1200, height: 630, alt: cover.alt || project.title }] : [] },
    twitter: { card: "summary_large_image", images: cover ? [cover.url] : [] },
  };
}
export default async function WorkDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params; const t = await getTranslations({ locale, namespace: "workDetail" }); const project = await getProjectBySlug(slug); if (!project) notFound();
  const localizedProject = locale === "en" ? { ...project, title: project.titleEn || project.title, shortDescription: project.shortDescriptionEn || project.shortDescription, role: project.roleEn || project.role } : project;
  const cover = project.media.find((m) => m.link.isCover)?.media ?? project.media[0]?.media ?? null;
  const mediaById = new Map<string, { url: string; alt: string | null }>();
  for (const { media } of project.media) if (media) mediaById.set(media.id, { url: media.url, alt: media.alt });
  if (project.caseStudy) {
    const ids = new Set<string>();
    for (const b of project.caseStudy.blocks) {
      const c = b.content as Record<string, unknown> | null; if (!c) continue;
      if (typeof c.mediaId === "string") ids.add(c.mediaId);
      if (Array.isArray(c.mediaIds)) for (const id of c.mediaIds) if (typeof id === "string") ids.add(id);
    }
    const missing = [...ids].filter((id) => !mediaById.has(id));
    if (missing.length > 0) {
      const more = await db.orm.public.Media.where((x) => x.id.in(missing)).all();
      for (const m of more) mediaById.set(m.id, { url: m.url, alt: m.alt });
    }
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahuna.is-a.dev";
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumbHome"), item: siteUrl },
      { "@type": "ListItem", position: 2, name: t("breadcrumbProjects"), item: `${siteUrl}/work` },
      { "@type": "ListItem", position: 3, name: localizedProject.title, item: `${siteUrl}/work/${project.slug}` },
    ],
  };
  const creativeLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: localizedProject.title,
    description: localizedProject.shortDescription,
    author: { "@type": "Person", name: "Romaric GBENOU" },
    datePublished: project.createdAt,
    image: cover?.url || undefined,
  };
  return (
    <article className={`${W} py-8`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeLd) }} />
      <Link href="/work" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-secondary hover:text-ink"><ArrowLeft className="h-3 w-3" /> {t("backToProjects")}</Link>
      <div className="mt-6 grid gap-6 md:grid-cols-12">
        <aside className="md:col-span-4 md:sticky md:top-[88px] md:self-start rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">{locale === "en" ? project.category.nameEn || project.category.name : project.category.name}</div>
          <h1 className="mt-2 text-[28px] font-extrabold leading-none tracking-tight text-ink">{localizedProject.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-secondary">{localizedProject.shortDescription}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">{project.technologies.map((t) => <span key={t.id} className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs text-secondary">{t.name}</span>)}</div>
          <div className="mt-4 flex flex-wrap gap-2">{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs font-bold text-bg">{t("viewSite")} <ArrowUpRight className="h-3 w-3" /></a>}{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-4 py-2 text-xs font-bold text-ink">GitHub <ArrowUpRight className="h-3 w-3" /></a>}</div>
        </aside>
        <div className="md:col-span-8 space-y-4">
          {cover && <div className="overflow-hidden rounded-2xl border border-border bg-surface"><div className="relative aspect-[16/10]"><Image src={cover.url} alt={cover.alt || project.title} fill className="object-cover" sizes="66vw" priority /></div></div>}
          {project.media.length>1 && <div className="grid grid-cols-2 gap-3">{project.media.slice(1,4).map(({media})=>media&&<div key={media.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface"><Image src={media.url} alt={media.alt || `${project.title} — image`} fill className="object-cover" sizes="33vw"/></div>)}</div>}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            {project.caseStudy && project.caseStudy.blocks.length>0 ? <CaseStudyRenderer blocks={project.caseStudy.blocks as unknown as CaseBlock[]} mediaById={mediaById}/> : <p className="text-secondary">{t("caseStudyComing")}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

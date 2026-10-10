import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/prisma/db";
import { getPublishedProjects } from "@/lib/dal/public";
import { getTranslations } from "next-intl/server";
export const revalidate = 60;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: locale === "en" ? "/en/work" : "/work",
      languages: { fr: "/work", en: "/en/work" },
    },
    openGraph: { url: `https://mahuna.is-a.dev${locale === "en" ? "/en" : ""}/work`, images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  };
}
const W = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8";
const PROJECT_EN: Record<string, { title: string; shortDescription: string }> = {
  "portfolio-v2": { title: "Portfolio V2", shortDescription: "A next-generation portfolio built with Next.js 16, Prisma 8 and an integrated back office." },
  "hemolink-xum15a": { title: "hemolink", shortDescription: "A fictional project created for a challenge focused on blood donation in Benin." },
};
export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work" });
  const projects = await getPublishedProjects();
  const projectIds = projects.map((p) => p.id);
  const [allMediaLinks, allTechLinks] = await Promise.all([
    projectIds.length
      ? db.orm.public.ProjectMedia.where((m) => m.projectId.in(projectIds)).orderBy((m) => m.displayOrder.asc()).all()
      : [],
    projectIds.length
      ? db.orm.public.ProjectTechnology.where((t) => t.projectId.in(projectIds)).orderBy((t) => t.displayOrder.asc()).all()
      : [],
  ]);
  const mediaById = new Map<string, { url: string; alt: string | null }>();
  const neededMediaIds = [...new Set(allMediaLinks.map((l) => l.mediaId))];
  if (neededMediaIds.length > 0) {
    const medias = await db.orm.public.Media.where((m) => m.id.in(neededMediaIds)).all();
    for (const med of medias) mediaById.set(med.id, { url: med.url, alt: med.alt });
  }
  const techById = new Map<string, { id: string; name: string }>();
  const neededTechIds = [...new Set(allTechLinks.map((l) => l.technologyId))];
  if (neededTechIds.length > 0) {
    const techs = await db.orm.public.Technology.where((t) => t.id.in(neededTechIds)).all();
    for (const t of techs) techById.set(t.id, t);
  }
  const enriched = projects.map((p) => {
    const links = allMediaLinks.filter((m) => m.projectId === p.id);
    const coverLink = links.find((m) => m.isCover) ?? links[0];
    const cover = coverLink ? (mediaById.get(coverLink.mediaId) ?? null) : null;
    const techs = allTechLinks
      .filter((t) => t.projectId === p.id)
      .slice(0, 3)
      .map((l) => techById.get(l.technologyId))
      .filter((t): t is NonNullable<typeof t> => t !== null && t !== undefined);
    const translated = locale === "en" ? PROJECT_EN[p.slug] : undefined;
    return { p: locale === "en" ? { ...p, title: p.titleEn || translated?.title || p.title, shortDescription: p.shortDescriptionEn || translated?.shortDescription || p.shortDescription, role: p.roleEn || p.role } : p, cover, techs };
  });
  return (
    <div className={`${W} py-10`}>
      <div className="mb-12">
        <div className="font-serif italic font-normal text-[22px] tracking-wide normal-case text-accent">{t("label")}</div>
        <h1 className="text-[clamp(28px,4.5vw,44px)] font-extrabold leading-[0.98] tracking-[-0.05em] text-ink">{t("title")}</h1>
        <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-secondary">{t("intro")}</p>
      </div>
      {enriched.length===0 ? <p className="text-secondary">{t("noPublished")}</p> : (
        <div className="space-y-6">
          {enriched.filter((_,i)=>i%3===0).map(({p, cover, techs})=>(
            <Link key={p.id} href={`/work/${p.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition grid md:grid-cols-2">
              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div><div className="font-mono text-xs text-muted">{locale === "en" ? p.category.nameEn || p.category.name : p.category.name} {p.year?`· ${p.year}`:""}</div><h3 className="mt-1 text-lg font-bold text-ink group-hover:text-accent">{p.title}</h3><p className="mt-2 text-sm text-secondary line-clamp-3">{p.shortDescription}</p><div className="mt-3 flex flex-wrap gap-1.5">{techs.map(t=><span key={t.id} className="rounded-full border border-border bg-bg px-2 py-1 text-xs text-secondary">{t.name}</span>)}</div></div>
                <div className="mt-4"><span className="group inline-flex items-center justify-center h-11 w-11 rounded-full border border-ink/10 bg-surface text-ink group-hover:border-ink group-hover:bg-ink group-hover:text-bg transition"><ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" /></span></div>
              </div>
              <div className="relative bg-surfaceSunken min-h-[240px] md:min-h-[260px] overflow-hidden border-t md:border-t-0 md:border-l border-border">
                {cover ? <Image src={cover.url} alt={cover.alt || p.title} fill className="object-cover group-hover:scale-[1.02] transition" sizes="(max-width: 768px) 100vw, 50vw" /> : <div className="w-full h-full bg-gradient-to-br from-surfaceSunken to-border flex items-center justify-center text-xs text-muted">{t("noImage")}</div>}
              </div>
            </Link>
          ))}
          {/* Duo pairs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enriched.filter((_,i)=>i%3!==0).map(({p, cover, techs})=>(
              <Link key={p.id} href={`/work/${p.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition flex flex-col">
                <div className="relative h-48 bg-surfaceSunken overflow-hidden">
                  {cover ? <Image src={cover.url} alt={cover.alt || p.title} fill className="object-cover group-hover:scale-[1.02] transition" sizes="50vw" /> : <div className="w-full h-full bg-gradient-to-br from-surfaceSunken to-border flex items-center justify-center text-xs text-muted">{t("noImage")}</div>}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div><div className="font-mono text-xs text-muted">{locale === "en" ? p.category.nameEn || p.category.name : p.category.name}</div><h3 className="mt-1 font-bold text-ink group-hover:text-accent line-clamp-2">{p.title}</h3><p className="mt-1 text-xs text-secondary line-clamp-3">{p.shortDescription}</p></div>
                  <div className="mt-3 flex items-center justify-between"><div className="flex flex-wrap gap-1">{techs.slice(0,2).map(t=><span key={t.id} className="px-2 py-0.5 rounded bg-bg border border-border text-xs text-secondary">{t.name}</span>)}</div><span className="group inline-flex items-center justify-center h-11 w-11 rounded-full border border-ink/10 bg-surface text-ink group-hover:border-ink group-hover:bg-ink group-hover:text-bg transition"><ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" /></span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/dal/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://mahuna.is-a.dev").replace(/\/$/, "");
  const projects = await getPublishedProjects().catch(() => []);
  const now = new Date();
  const latest = projects.length ? new Date(Math.max(...projects.map((p) => new Date(p.updatedAt).getTime()))) : now;
  return [
    { url: `${base}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/en`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/work`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/en/work`, lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${base}/en/work/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

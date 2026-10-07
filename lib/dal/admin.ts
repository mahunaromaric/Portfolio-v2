import { db } from "@/prisma/db";

// ── Admin : listes complètes (tous statuts) ──

export const adminList = {
  projects: () =>
    db.orm.public.Project.orderBy([(p) => p.displayOrder.asc(), (p) => p.createdAt.desc()])
      .limit(200)
      .include("category")
      .all(),
  categories: () => db.orm.public.ProjectCategory.orderBy((c) => c.name.asc()).limit(200).all(),
  technologies: () => db.orm.public.Technology.orderBy((t) => t.name.asc()).limit(300).all(),
  techCategories: () =>
    db.orm.public.TechnologyCategory.orderBy((c) => c.displayOrder.asc()).limit(100).all(),
  media: () => db.orm.public.Media.orderBy((m) => m.createdAt.desc()).limit(200).all(),
  experiences: () =>
    db.orm.public.Experience.orderBy((e) => e.displayOrder.asc()).limit(200).all(),
  educations: () =>
    db.orm.public.Education.orderBy((e) => e.displayOrder.asc()).limit(200).all(),
  services: () => db.orm.public.Service.orderBy((s) => s.displayOrder.asc()).limit(200).all(),
  messages: () =>
    db.orm.public.Message.orderBy((m) => m.createdAt.desc()).limit(200).all(),
  collaborationPhases: () =>
    db.orm.public.CollaborationPhase.orderBy((c) => c.displayOrder.asc()).limit(100).all(),
  newMessageCount: async () => {
    const r = await db.orm.public.Message.where((m) => m.status.eq("NEW")).aggregate((a) => ({ n: a.count() }));
    return r.n;
  },
  // ── Dashboard santé (comptes SQL, fenêtre 14j pour le trend) ──
  dashboard: async () => {
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const iso14 = new Date(now - 14 * day).toISOString();
    const [
      projectTotal, messageTotal, serviceTotal, mediaTotal, expTotal,
      projectGroups, messageGroups, mediaGroups,
      featuredTotal, withMediaGroups, sizeTotal,
      recentMessages,
    ] = await Promise.all([
      db.orm.public.Project.aggregate((a) => ({ n: a.count() })),
      db.orm.public.Message.aggregate((a) => ({ n: a.count() })),
      db.orm.public.Service.aggregate((a) => ({ n: a.count() })),
      db.orm.public.Media.aggregate((a) => ({ n: a.count() })),
      db.orm.public.Experience.aggregate((a) => ({ n: a.count() })),
      db.orm.public.Project.groupBy("status").aggregate((a) => ({ n: a.count() })),
      db.orm.public.Message.groupBy("status").aggregate((a) => ({ n: a.count() })),
      db.orm.public.Media.groupBy("type").aggregate((a) => ({ n: a.count() })),
      db.orm.public.Project.where((p) => p.featured.eq(true)).aggregate((a) => ({ n: a.count() })),
      db.orm.public.ProjectMedia.groupBy("projectId").aggregate((a) => ({ n: a.count() })),
      db.orm.public.Media.aggregate((a) => ({ total: a.sum("size") })),
      db.orm.public.Message.where((m) => m.createdAt.gte(iso14)).all(),
    ]);
    const pick = (groups: Array<Record<string, unknown>>, key: string, field: string): number => {
      const g = groups.find((x) => x[field] === key);
      const n = g?.n;
      return typeof n === "number" ? n : 0;
    };
    const projectByStatus = {
      PUBLISHED: pick(projectGroups, "PUBLISHED", "status"),
      DRAFT: pick(projectGroups, "DRAFT", "status"),
      HIDDEN: pick(projectGroups, "HIDDEN", "status"),
    };
    const messageByStatus = {
      NEW: pick(messageGroups, "NEW", "status"),
      READ: pick(messageGroups, "READ", "status"),
      REPLIED: pick(messageGroups, "REPLIED", "status"),
      ARCHIVED: pick(messageGroups, "ARCHIVED", "status"),
    };
    // trend 14 derniers jours
    const trend = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now - (13 - i) * day);
      const iso = d.toISOString().slice(0, 10);
      const count = recentMessages.filter((m) => String(m.createdAt).slice(0, 10) === iso).length;
      return { date: iso.slice(5), count };
    });
    // santé projet : % avec au moins 1 média + featured (même formule qu'avant, données exactes)
    const withMedia = withMediaGroups.length;
    const featured = featuredTotal.n;
    const total = projectTotal.n;
    const health = total ? Math.round(((withMedia + featured) / (total * 2)) * 100) : 0;
    // stockage
    const totalSize = sizeTotal.total ?? 0;
    const byType = {
      IMAGE: pick(mediaGroups, "IMAGE", "type"),
      VIDEO: pick(mediaGroups, "VIDEO", "type"),
      DOCUMENT: pick(mediaGroups, "DOCUMENT", "type"),
    };
    // 7j delta
    const last7 = recentMessages.filter((m) => now - new Date(String(m.createdAt)).getTime() < 7 * day).length;
    const prev7 = recentMessages.filter((m) => {
      const t = new Date(String(m.createdAt)).getTime();
      return t >= now - 14 * day && t < now - 7 * day;
    }).length;
    return {
      counts: { projects: total, messages: messageTotal.n, services: serviceTotal.n, media: mediaTotal.n, experiences: expTotal.n },
      projectByStatus,
      messageByStatus,
      trend,
      health: { pct: health, withMedia, featured, total },
      storage: { totalSize, byType, total: mediaTotal.n },
      delta7: { last7, prev7, diff: last7 - prev7 },
    };
  },
};

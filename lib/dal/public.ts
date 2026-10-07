import { db } from "@/prisma/db";

// ── Lecture publique (PUBLISHED uniquement) ──

export async function getProfile() {
  const profile = await db.orm.public.Profile.limit(1).all().then((r) => r[0] ?? null);
  if (!profile) return null;
  const socialLinks = await db.orm.public.SocialLink.where((s) => s.profileId.eq(profile.id))
    .orderBy((s) => s.displayOrder.asc())
    .all();
  return { ...profile, socialLinks };
}

export async function getPublishedProjects() {
  return db.orm.public.Project.where((p) => p.status.eq("PUBLISHED"))
    .orderBy([(p) => p.displayOrder.asc(), (p) => p.createdAt.desc()])
    .include("category")
    .all();
}

export async function getFeaturedProjects() {
  return db.orm.public.Project.where((p) => p.status.eq("PUBLISHED"))
    .where((p) => p.featured.eq(true))
    .orderBy((p) => p.displayOrder.asc())
    .limit(6)
    .include("category")
    .all();
}

export async function getProjectBySlug(slug: string) {
  const project = await db.orm.public.Project.where((p) => p.slug.eq(slug)).include("category").first();
  if (!project || project.status !== "PUBLISHED") return null;

  const techLinks = await db.orm.public.ProjectTechnology.where((t) => t.projectId.eq(project.id))
    .orderBy((t) => t.displayOrder.asc())
    .all();
  const technologies = await Promise.all(
    techLinks.map((l) => db.orm.public.Technology.where((t) => t.id.eq(l.technologyId)).first()),
  );

  const mediaLinks = await db.orm.public.ProjectMedia.where((m) => m.projectId.eq(project.id))
    .orderBy((m) => m.displayOrder.asc())
    .all();
  const media = await Promise.all(
    mediaLinks.map(async (l) => ({
      link: l,
      media: await db.orm.public.Media.where((m) => m.id.eq(l.mediaId)).first(),
    })),
  );

  const caseStudy = await db.orm.public.CaseStudy.where((c) => c.projectId.eq(project.id)).first();
  const blocks = caseStudy
    ? await db.orm.public.CaseStudyBlock.where((b) => b.caseStudyId.eq(caseStudy.id))
        .orderBy((b) => b.displayOrder.asc())
        .all()
    : [];

  return {
    ...project,
    technologies: technologies.filter((t) => t !== null),
    media: media.filter((m) => m.media !== null),
    caseStudy: caseStudy ? { ...caseStudy, blocks } : null,
  };
}

export async function getTechnologiesGrouped() {
  const categories = await db.orm.public.TechnologyCategory.orderBy((c) => c.displayOrder.asc()).all();
  const grouped = await Promise.all(
    categories.map(async (cat) => ({
      ...cat,
      technologies: await db.orm.public.Technology.where((t) => t.categoryId.eq(cat.id)).all(),
    })),
  );
  const uncategorized = await db.orm.public.Technology.where((t) => t.categoryId.isNull()).all();
  return { grouped, uncategorized };
}

export async function getPublishedExperiences() {
  return db.orm.public.Experience.where((e) => e.status.eq("PUBLISHED"))
    .orderBy((e) => e.displayOrder.asc())
    .all();
}

export async function getPublishedEducations() {
  return db.orm.public.Education.where((e) => e.status.eq("PUBLISHED"))
    .orderBy((e) => e.displayOrder.asc())
    .all();
}

export async function getPublishedServices() {
  return db.orm.public.Service.where((s) => s.status.eq("PUBLISHED"))
    .orderBy((s) => s.displayOrder.asc())
    .all();
}

export async function getCollaborationPhases(locale = "fr") {
  const phases = await db.orm.public.CollaborationPhase.orderBy((c) => c.displayOrder.asc()).all();
  if (phases.length === 0) {
    return locale === "en"
      ? [
          { id: "p1", number: 1, title: "One point of contact", description: "From the first conversation to the final lines of code, I stay involved from start to finish.", displayOrder: 0 },
          { id: "p2", number: 2, title: "The need", description: "Understand the problem, users and goals before anything else.", displayOrder: 1 },
          { id: "p3", number: 3, title: "Delivery", description: "Refine, finalize and ship.", displayOrder: 2 },
        ]
      : [
          { id: "p1", number: 1, title: "Un seul interlocuteur", description: "Du premier échange aux dernières lignes de code, je reste impliqué de bout en bout.", displayOrder: 0 },
          { id: "p2", number: 2, title: "Le besoin", description: "Comprendre le problème, les utilisateurs et les objectifs avant toute chose.", displayOrder: 1 },
          { id: "p3", number: 3, title: "Livraison", description: "Ajuster, finaliser et livrer", displayOrder: 2 },
        ];
  }
  return phases;
}

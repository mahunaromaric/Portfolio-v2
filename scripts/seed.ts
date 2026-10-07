import "dotenv/config";
import { db } from "../prisma/db";

async function main() {
  // ── Profile singleton ──
  let profile = await db.orm.public.Profile.limit(1).all().then((r) => r[0] ?? null);
  if (!profile) {
    profile = await db.orm.public.Profile.create({
      name: "Votre Nom",
      headline: "Développeur Full-Stack",
      bio: "Bienvenue sur mon portfolio. Modifie ce texte depuis le back-office (/admin).",
      location: "Paris, France",
      availabilityLabel: "Disponible pour missions",
      avatarUrl: null,
      cvUrl: null,
      contactEmail: "contact@example.com",
    });
    console.log("profile created");
  }
  const existingLinks = await db.orm.public.SocialLink.where((s) => s.profileId.eq(profile.id)).all();
  if (existingLinks.length === 0) {
    for (const [i, l] of [
      { platform: "GitHub", url: "https://github.com/" },
      { platform: "LinkedIn", url: "https://linkedin.com/" },
      { platform: "WhatsApp", url: "https://wa.me/2290161642237" },
    ].entries()) {
      await db.orm.public.SocialLink.create({ ...l, label: null, displayOrder: i, profileId: profile.id });
    }
    console.log("social links seeded");
  }

  // ── Catégories ──
  async function ensureProjectCategory(name: string, slug: string, description: string | null) {
    const found = await db.orm.public.ProjectCategory.where((c) => c.slug.eq(slug)).first();
    if (found) return found;
    return db.orm.public.ProjectCategory.create({ name, slug, description });
  }
  const webCat = await ensureProjectCategory("Applications Web", "web", "Apps et sites web.");
  await ensureProjectCategory("Mobile", "mobile", "Apps mobiles.");
  await ensureProjectCategory("Open Source", "open-source", "Contributions open source.");

  // ── Technos ──
  async function ensureTechCategory(name: string, slug: string, order: number) {
    const found = await db.orm.public.TechnologyCategory.where((c) => c.slug.eq(slug)).first();
    if (found) return found;
    return db.orm.public.TechnologyCategory.create({ name, slug, displayOrder: order });
  }
  const frontend = await ensureTechCategory("Frontend", "frontend", 0);
  const backend = await ensureTechCategory("Backend", "backend", 1);
  const exploringCat = await ensureTechCategory("En exploration", "exploring", 99);

  async function ensureTech(name: string, slug: string, categoryId: string | null, proficiency: number | null) {
    const found = await db.orm.public.Technology.where((t) => t.slug.eq(slug)).first();
    if (found) return found;
    return db.orm.public.Technology.create({ name, slug, icon: null, websiteUrl: null, proficiency, categoryId });
  }
  const next = await ensureTech("Next.js", "nextjs", frontend.id, 5);
  const react = await ensureTech("React", "react", frontend.id, 5);
  const ts = await ensureTech("TypeScript", "typescript", frontend.id, 4);
  const pg = await ensureTech("PostgreSQL", "postgresql", backend.id, 4);
  const prisma = await ensureTech("Prisma", "prisma", backend.id, 4);
  const node = await ensureTech("Node.js", "nodejs", backend.id, 4);
  await ensureTech("Golang", "golang", exploringCat.id, null);
  await ensureTech("Framer Motion", "framer-motion", exploringCat.id, null);

  // ── Projet exemple ──
  const projSlug = "portfolio-v2";
  let project = await db.orm.public.Project.where((p) => p.slug.eq(projSlug)).first();
  if (!project) {
    project = await db.orm.public.Project.create({
      title: "Portfolio V2",
      slug: projSlug,
      shortDescription: "Mon portfolio nouvelle génération : Next.js 16, Prisma 8, back-office intégré.",
      year: 2026,
      role: "Design + Développement",
      status: "PUBLISHED",
      featured: true,
      displayOrder: 0,
      liveUrl: null,
      githubUrl: null,
      categoryId: webCat.id,
    });
    let order = 0;
    for (const t of [next, react, ts, pg, prisma, node]) {
      await db.orm.public.ProjectTechnology.create({ projectId: project.id, technologyId: t.id, displayOrder: order++ });
    }
    const cs = await db.orm.public.CaseStudy.create({ projectId: project.id });
    const blocks: Array<{ type: "TEXT" | "FEATURES" | "TECHNICAL" | "QUOTE"; title: string; content: unknown }> = [
      { type: "TEXT", title: "Contexte", content: { markdown: "Refonte complète de mon portfolio. Objectif : un site vitrine performant avec un back-office maison pour publier mes projets sans redéployer." } },
      { type: "TEXT", title: "Problème", content: { markdown: "Comment garder le contenu éditable, le design fidèle à la maquette et le déploiement simple, sans dépendre d’un CMS externe ?" } },
      { type: "FEATURES", title: "Objectifs", content: { items: ["Back-office CRUD complet", "Upload médias S3/local", "Messagerie anti-spam (Turnstile + honeypot)", "SEO et sitemap dynamiques"] } },
      { type: "TEXT", title: "Approche", content: { markdown: "Contrat Prisma 8 d’abord (17 modèles), puis DAL typée, ensuite UI multi-page en Manrope. Le contenu suit le besoin, la technique suit le contenu." } },
      { type: "FEATURES", title: "Produit", content: { items: ["Pages Accueil / Réalisations / À propos / Contact", "Études de cas par blocs titrés", "Rate-limit login et sessions signées"] } },
      { type: "TECHNICAL", title: "Choix techniques", content: { points: ["Next.js 16 App Router + Server Actions", "Prisma 8 contrat-first + PostgreSQL 16", "Zod pour la validation, scrypt pour les mots de passe"] } },
      { type: "TEXT", title: "Défis", content: { markdown: "Gérer les blocs polymorphes en Json validé, assurer le fallback S3/local et garder les migrations rejouables." } },
      { type: "FEATURES", title: "Résultat", content: { items: ["Site publiable depuis /admin", "Build et vérifs verts", "Base prête pour la prod"] } },
    ];
    let bOrder = 0;
    for (const b of blocks) {
      await db.orm.public.CaseStudyBlock.create({
        caseStudyId: cs.id,
        type: b.type,
        title: b.title,
        content: b.content as never,
        displayOrder: bOrder++,
      });
    }
    console.log("demo project seeded");
  }

  // ── Expérience / formation exemples ──
  const exps = await db.orm.public.Experience.limit(1).all();
  if (exps.length === 0) {
    await db.orm.public.Experience.create({
      company: "Exemple Studio",
      role: "Développeur Full-Stack",
      location: "Paris",
      startDate: "2023-01-01T00:00:00Z",
      endDate: null,
      description: "Modifie depuis /admin.",
      status: "PUBLISHED",
      displayOrder: 0,
    });
    console.log("experience seeded");
  }
  const edus = await db.orm.public.Education.limit(1).all();
  if (edus.length === 0) {
    await db.orm.public.Education.create({
      institution: "Université Exemple",
      program: "Master Informatique",
      location: "Paris",
      startDate: "2020-09-01T00:00:00Z",
      endDate: "2023-06-30T00:00:00Z",
      description: null,
      status: "PUBLISHED",
      displayOrder: 0,
    });
    console.log("education seeded");
  }
  console.log("Seed OK");

  const phases = await db.orm.public.CollaborationPhase.limit(10).all();
  if (phases.length === 0) {
    for (const p of [{ number: 1, title: "Un seul interlocuteur", description: "Du premier échange aux dernières lignes de code, je reste impliqué de bout en bout.", displayOrder: 0 }, { number: 2, title: "Le besoin", description: "Comprendre le problème, les utilisateurs et les objectifs avant toute chose.", displayOrder: 1 }, { number: 3, title: "Livraison", description: "Ajuster, finaliser et livrer", displayOrder: 2 }]) {
      await db.orm.public.CollaborationPhase.create(p);
    }
    console.log("collaboration phases seeded");
  }

  await db.close();
}

main().catch(async (e) => {
  console.error(e);
  await db.close();
  process.exit(1);
});

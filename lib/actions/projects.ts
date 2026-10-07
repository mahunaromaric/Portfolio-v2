"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import { autoTranslateEn } from "@/lib/ai/translate";
import {
  projectSchema,
  projectCategorySchema,
  technologySchema,
  technologyCategorySchema,
  caseStudyBlockSchema,
  normalizeUrl,
} from "@/lib/validation";

// ── Project categories ──
export async function upsertProjectCategory(formData: FormData) {
  await requireAdmin();
  const parsed = projectCategorySchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn") || undefined,
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides." );
  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId.trim() !== "" ? rawId.trim() : undefined;
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const nameEn = parsed.data.nameEn || (await autoTranslateEn(parsed.data.name)) || null;
  const descriptionEn = parsed.data.descriptionEn || (await autoTranslateEn(parsed.data.description)) || null;

  if (id) {
    try {
      await db.orm.public.ProjectCategory.where((c) => c.id.eq(id)).update({
        name: parsed.data.name,
        nameEn,
        slug,
        description: parsed.data.description ?? null,
        descriptionEn,
      });
    } catch {
      throw new Error("Slug déjà utilisé par une autre catégorie.");
    }
  } else {
    try {
      await db.orm.public.ProjectCategory.create({ name: parsed.data.name, nameEn, slug, description: parsed.data.description ?? null, descriptionEn });
    } catch {
      throw new Error("Slug déjà utilisé par une autre catégorie.");
    }
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  revalidatePath(`/work/${slug}`);
  return;
}

export async function deleteProjectCategory(id: string) {
  await requireAdmin();
  const count = await db.orm.public.Project.where((p) => p.categoryId.eq(id)).limit(1).all();
  if (count.length > 0) return { error: "Catégorie utilisée par des projets." };
  await db.orm.public.ProjectCategory.where((c) => c.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Projects ──
export async function upsertProject(formData: FormData) {
  await requireAdmin();
  const rawList = formData.getAll("technologyIds");
  const techIds = rawList.length
    ? rawList.flatMap((v) => (typeof v === "string" ? v.split(",") : [])).map((s) => s.trim()).filter(Boolean)
    : (() => {
        const single = formData.get("technologyIds");
        return typeof single === "string" && single ? single.split(",").map((s) => s.trim()).filter(Boolean) : [];
      })();
  // Filtre souple : garde seulement les UUID valides, signale les autres sans planter
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const invalid = techIds.filter((id) => !uuidRe.test(id));
  if (invalid.length) throw new Error(`Technos invalides : ${invalid.slice(0, 3).join(", ")} — coche les cases, ne tape pas l'ID à la main.`);
  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    titleEn: formData.get("titleEn") || undefined,
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription"),
    shortDescriptionEn: formData.get("shortDescriptionEn") || undefined,
    year: formData.get("year") || undefined,
    role: formData.get("role") || undefined,
    roleEn: formData.get("roleEn") || undefined,
    status: formData.get("status") || "PUBLISHED",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    displayOrder: formData.get("displayOrder") || 0,
    liveUrl: normalizeUrl(formData.get("liveUrl")),
    githubUrl: normalizeUrl(formData.get("githubUrl")),
    categoryId: formData.get("categoryId"),
    technologyIds: techIds.filter((id) => uuidRe.test(id)),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides." );
  const id = (formData.get("id") as string | null) || undefined;
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : uniqueSlug(parsed.data.title);

  const payload = {
    title: parsed.data.title,
    titleEn: parsed.data.titleEn || (await autoTranslateEn(parsed.data.title)) || null,
    slug,
    shortDescription: parsed.data.shortDescription,
    shortDescriptionEn: parsed.data.shortDescriptionEn || (await autoTranslateEn(parsed.data.shortDescription)) || null,
    year: parsed.data.year ?? null,
    role: parsed.data.role || null,
    roleEn: parsed.data.roleEn || (await autoTranslateEn(parsed.data.role)) || null,
    status: parsed.data.status,
    featured: parsed.data.featured,
    displayOrder: parsed.data.displayOrder,
    liveUrl: parsed.data.liveUrl || null,
    githubUrl: parsed.data.githubUrl || null,
    categoryId: parsed.data.categoryId,
  };

  let projectId = id;
  try {
    if (id) {
      await db.orm.public.Project.where((p) => p.id.eq(id)).update(payload);
    } else {
      const created = await db.orm.public.Project.create(payload);
      projectId = created.id;
    }
  } catch {
    throw new Error("Slug déjà utilisé par un autre projet.");
  }

  // Sync technologies : remplace tous les liens du projet (dédupliqués + réessai anti double-clic).
  // Les créations concurrentes en double sont bénignes (ligne déjà présente = état désiré).
  const isDupKey = (e: unknown) =>
    e instanceof Error && /duplicate key|unique constraint/i.test(e.message);
  const techSync = async () => {
    await db.orm.public.ProjectTechnology.where((t) => t.projectId.eq(projectId!)).delete();
    let order = 0;
    for (const techId of [...new Set(parsed.data.technologyIds)]) {
      try {
        await db.orm.public.ProjectTechnology.create({ projectId: projectId!, technologyId: techId, displayOrder: order++ });
      } catch (e) {
        if (!isDupKey(e)) throw e;
      }
    }
  };
  try {
    await techSync();
  } catch {
    await techSync();
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  revalidatePath(`/work/${slug}`);
  return;
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const toDelete = await db.orm.public.Project.where((p) => p.id.eq(id)).first();
  await db.transaction(async (tx) => {
    await tx.orm.public.ProjectMedia.where((m) => m.projectId.eq(id)).delete();
    await tx.orm.public.ProjectTechnology.where((t) => t.projectId.eq(id)).delete();
    const cs = await tx.orm.public.CaseStudy.where((c) => c.projectId.eq(id)).first();
    if (cs) {
      const blocks = await tx.orm.public.CaseStudyBlock.where((b) => b.caseStudyId.eq(cs.id)).all();
      for (const b of blocks) {
        await tx.orm.public.CaseStudyBlock.where((x) => x.id.eq(b.id)).delete();
      }
      await tx.orm.public.CaseStudy.where((c) => c.id.eq(cs.id)).delete();
    }
    await tx.orm.public.Project.where((p) => p.id.eq(id)).delete();
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  if (toDelete) revalidatePath(`/work/${toDelete.slug}`);
  return { ok: true };
}

// ── Technologies ──
export async function upsertTechnology(formData: FormData) {
  await requireAdmin();
  const parsed = technologySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    icon: normalizeUrl(formData.get("icon")),
    websiteUrl: normalizeUrl(formData.get("websiteUrl")),
    proficiency: formData.get("proficiency") || undefined,
    categoryId: formData.get("categoryId") || "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides." );
  const id = (formData.get("id") as string | null) || undefined;
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const payload = {
    name: parsed.data.name,
    slug,
    icon: parsed.data.icon || null,
    websiteUrl: parsed.data.websiteUrl || null,
    proficiency: parsed.data.proficiency ?? null,
    categoryId: parsed.data.categoryId || null,
  };
  if (id) {
    await db.orm.public.Technology.where((t) => t.id.eq(id)).update(payload);
  } else {
    await db.orm.public.Technology.create(payload);
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function deleteTechnology(id: string) {
  await requireAdmin();
  await db.orm.public.Technology.where((t) => t.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function upsertTechnologyCategory(formData: FormData) {
  await requireAdmin();
  const parsed = technologyCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
  });
  if (!parsed.success) throw new Error("Données invalides." );
  const id = (formData.get("id") as string | null) || undefined;
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  if (id) {
    await db.orm.public.TechnologyCategory.where((c) => c.id.eq(id)).update({
      name: parsed.data.name,
      slug,
      displayOrder: parsed.data.displayOrder,
    });
  } else {
    await db.orm.public.TechnologyCategory.create({ name: parsed.data.name, slug, displayOrder: parsed.data.displayOrder });
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function deleteTechnologyCategory(id: string) {
  await requireAdmin();
  await db.orm.public.TechnologyCategory.where((c) => c.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Case study blocks ──
export async function upsertCaseStudyBlock(formData: FormData) {
  await requireAdmin();
  const rawContent = formData.get("content");
  let content: unknown = undefined;
  try {
    content = typeof rawContent === "string" && rawContent ? JSON.parse(rawContent) : undefined;
  } catch {
    throw new Error("Contenu JSON invalide." );
  }
  const parsed = caseStudyBlockSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
    content,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Bloc invalide." );

  const caseStudyId = formData.get("caseStudyId") as string;
  const id = (formData.get("id") as string | null) || undefined;
  if (id) {
    await db.orm.public.CaseStudyBlock.where((b) => b.id.eq(id)).update({
      type: parsed.data.type,
      title: parsed.data.title ?? null,
      content: (parsed.data.content ?? null) as never,
      displayOrder: parsed.data.displayOrder,
    });
  } else {
    await db.orm.public.CaseStudyBlock.create({
      caseStudyId,
      type: parsed.data.type,
      title: parsed.data.title ?? null,
      content: (parsed.data.content ?? null) as never,
      displayOrder: parsed.data.displayOrder,
    });
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function ensureCaseStudy(projectId: string) {
  await requireAdmin();
  const existing = await db.orm.public.CaseStudy.where((c) => c.projectId.eq(projectId)).first();
  if (existing) return;
  try {
    await db.orm.public.CaseStudy.create({ projectId });
  } catch {
    // Double-clic : une requête concurrente l'a déjà créée.
    const retry = await db.orm.public.CaseStudy.where((c) => c.projectId.eq(projectId)).first();
    if (!retry) throw new Error("Création impossible, réessayez.");
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function deleteCaseStudyBlock(id: string) {
  await requireAdmin();
  await db.orm.public.CaseStudyBlock.where((b) => b.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

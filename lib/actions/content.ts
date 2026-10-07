"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { requireAdmin, requestMeta, requestIp } from "@/lib/auth";
import { contactSchema, profileSchema, socialLinkSchema, experienceSchema, educationSchema, collaborationPhaseSchema, serviceSchema, messageStatus } from "@/lib/validation";
import { hashIp } from "@/lib/crypto";
import { verifyTurnstile } from "@/lib/turnstile";
import { autoTranslateEn } from "@/lib/ai/translate";
import { normalizeUrl } from "@/lib/validation";

// ── Contact public (honeypot + Turnstile + anti-spam 60s/IP) ──
export async function submitContact(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject") || undefined,
    content: formData.get("content"),
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Message invalide." };
  if (parsed.data.website) return { ok: true }; // honeypot rempli = bot, réponse silencieuse

  const meta = await requestMeta();
  const turnstileToken = formData.get("turnstileToken");
  const human = await verifyTurnstile(
    typeof turnstileToken === "string" ? turnstileToken : null,
    await requestIp(),
  );
  if (!human) return { error: "Vérification anti-robot échouée. Veuillez réessayer." };
  if (meta.ipHash) {
    const recent = await db.orm.public.Message.where((m) => m.ipHash.eq(meta.ipHash!))
      .orderBy((m) => m.createdAt.desc())
      .limit(1)
      .all();
    if (recent[0] && Date.now() - new Date(recent[0].createdAt).getTime() < 60_000) {
      return { error: "Veuillez patienter une minute avant de renvoyer un message." };
    }
  }

  const phoneStr = (parsed.data.phone || "").replace(/[\s\-\(\)\+]/g, "");
  await db.orm.public.Message.create({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    content: parsed.data.content,
    status: "NEW",
    ipHash: meta.ipHash,
    userAgent: meta.userAgent,
  });
  const waLink = phoneStr ? `https://wa.me/${phoneStr}?text=${encodeURIComponent(`Bonjour,\n\nNom : ${parsed.data.name}\nEmail : ${parsed.data.email}\nTéléphone : ${parsed.data.phone}\n\n${parsed.data.content}`)}` : null;
  return { ok: true, waLink };
}

export async function setMessageStatus(id: string, status: string) {
  await requireAdmin();
  const parsed = messageStatus.safeParse(status);
  if (!parsed.success) return { error: "Statut invalide." };
  await db.orm.public.Message.where((m) => m.id.eq(id)).update({ status: parsed.data });
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await db.orm.public.Message.where((m) => m.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Profile ──
export async function upsertProfile(formData: FormData) {
  await requireAdmin();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    headline: formData.get("headline"),
    location: formData.get("location") || undefined,
    availabilityLabel: formData.get("availabilityLabel") || undefined,
    availabilityLabelEn: formData.get("availabilityLabelEn") || undefined,
    avatarUrl: normalizeUrl(formData.get("avatarUrl")),
    contactEmail: formData.get("contactEmail") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides." );

  const existing = await db.orm.public.Profile.limit(1).all().then((r) => r[0] ?? null);
  const clean = {
    name: parsed.data.name,
    headline: parsed.data.headline,
    headlineEn: existing?.headlineEn ?? null,
    bio: existing?.bio ?? "",
    bioEn: existing?.bioEn ?? null,
    location: parsed.data.location || null,
    availabilityLabel: parsed.data.availabilityLabel || null,
    availabilityLabelEn: parsed.data.availabilityLabelEn || (await autoTranslateEn(parsed.data.availabilityLabel)) || null,
    avatarUrl: parsed.data.avatarUrl || null,
    cvUrl: existing?.cvUrl ?? null,
    contactEmail: parsed.data.contactEmail || null,
  };
  if (existing) {
    await db.orm.public.Profile.where((p) => p.id.eq(existing.id)).update(clean);
  } else {
    await db.orm.public.Profile.create(clean);
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function upsertSocialLink(formData: FormData) {
  await requireAdmin();
  const parsed = socialLinkSchema.safeParse({
    platform: formData.get("platform"),
    url: formData.get("url"),
    label: formData.get("label") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
  });
  if (!parsed.success) throw new Error("Lien invalide." );
  const profileId = formData.get("profileId") as string;
  const id = (formData.get("id") as string | null) || undefined;
  if (id) {
    await db.orm.public.SocialLink.where((s) => s.id.eq(id)).update({
      platform: parsed.data.platform,
      url: parsed.data.url,
      label: parsed.data.label ?? null,
      displayOrder: parsed.data.displayOrder,
    });
  } else {
    await db.orm.public.SocialLink.create({ ...parsed.data, label: parsed.data.label ?? null, profileId });
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function deleteSocialLink(id: string) {
  await requireAdmin();
  await db.orm.public.SocialLink.where((s) => s.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Experience / Education ──
export async function upsertExperience(formData: FormData) {
  await requireAdmin();
  const parsed = experienceSchema.safeParse({
    company: formData.get("company"),
    companyEn: formData.get("companyEn") || undefined,
    role: formData.get("role"),
    roleEn: formData.get("roleEn") || undefined,
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || "",
    description: formData.get("description") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    status: formData.get("status") || "PUBLISHED",
    displayOrder: formData.get("displayOrder") || 0,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides." );
  const id = (formData.get("id") as string | null) || undefined;
  const payload = {
    company: parsed.data.company,
    companyEn: parsed.data.companyEn || (await autoTranslateEn(parsed.data.company)) || null,
    role: parsed.data.role,
    roleEn: parsed.data.roleEn || (await autoTranslateEn(parsed.data.role)) || null,
    location: parsed.data.location || null,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate || null,
    description: parsed.data.description || null,
    descriptionEn: parsed.data.descriptionEn || (await autoTranslateEn(parsed.data.description)) || null,
    status: parsed.data.status,
    displayOrder: parsed.data.displayOrder,
  };
  if (id) await db.orm.public.Experience.where((e) => e.id.eq(id)).update(payload);
  else await db.orm.public.Experience.create(payload);
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  await db.orm.public.Experience.where((e) => e.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function upsertEducation(formData: FormData) {
  await requireAdmin();
  const parsed = educationSchema.safeParse({
    institution: formData.get("institution"),
    institutionEn: formData.get("institutionEn") || undefined,
    program: formData.get("program"),
    programEn: formData.get("programEn") || undefined,
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || "",
    description: formData.get("description") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    status: formData.get("status") || "PUBLISHED",
    displayOrder: formData.get("displayOrder") || 0,
  });
  if (!parsed.success) throw new Error("Données invalides." );
  const id = (formData.get("id") as string | null) || undefined;
  const payload = {
    institution: parsed.data.institution,
    institutionEn: parsed.data.institutionEn || (await autoTranslateEn(parsed.data.institution)) || null,
    program: parsed.data.program,
    programEn: parsed.data.programEn || (await autoTranslateEn(parsed.data.program)) || null,
    location: parsed.data.location || null,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate || null,
    description: parsed.data.description || null,
    descriptionEn: parsed.data.descriptionEn || (await autoTranslateEn(parsed.data.description)) || null,
    status: parsed.data.status,
    displayOrder: parsed.data.displayOrder,
  };
  if (id) await db.orm.public.Education.where((e) => e.id.eq(id)).update(payload);
  else await db.orm.public.Education.create(payload);
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function deleteEducation(id: string) {
  await requireAdmin();
  await db.orm.public.Education.where((e) => e.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function upsertService(formData: FormData) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse({
    title: formData.get("title"),
    titleEn: formData.get("titleEn") || undefined,
    description: formData.get("description") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
    status: formData.get("status") || "PUBLISHED",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides.");
  const data = { ...parsed.data } as Omit<typeof parsed.data, "titleEn" | "descriptionEn"> & { titleEn?: string | null; descriptionEn?: string | null };
  data.titleEn = data.titleEn || (await autoTranslateEn(data.title));
  data.descriptionEn = data.descriptionEn || (await autoTranslateEn(data.description));
  const payload = {
    title: data.title,
    titleEn: data.titleEn || null,
    description: data.description || null,
    descriptionEn: data.descriptionEn || null,
    displayOrder: data.displayOrder,
    status: data.status,
  };
  const id = (formData.get("id") as string | null) || undefined;
  if (id) await db.orm.public.Service.where((s) => s.id.eq(id)).update(payload);
  else await db.orm.public.Service.create(payload);
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function deleteService(id: string) {
  await requireAdmin();
  await db.orm.public.Service.where((s) => s.id.eq(id)).delete();
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function upsertCollaborationPhase(formData: FormData) {
  await requireAdmin();
  const parsed = collaborationPhaseSchema.safeParse({
    number: formData.get("number"),
    title: formData.get("title") || undefined,
    titleEn: formData.get("titleEn") || undefined,
    description: formData.get("description") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    displayOrder: formData.get("displayOrder"),
    id: formData.get("id") as string | undefined,
  });
  if (!parsed.success) throw new Error("Données invalides.");
  const data = { ...parsed.data } as typeof parsed.data & { titleEn?: string; descriptionEn?: string };
  data.titleEn = data.titleEn || (await autoTranslateEn(data.title)) || undefined;
  data.descriptionEn = data.descriptionEn || (await autoTranslateEn(data.description)) || undefined;
  const id = data.id;
  const payload = {
    number: data.number,
    title: data.title,
    titleEn: data.titleEn || null,
    description: data.description,
    descriptionEn: data.descriptionEn || null,
    displayOrder: data.displayOrder,
  };
  if (id) await db.orm.public.CollaborationPhase.where((c) => c.id.eq(id)).update(payload);
  else await db.orm.public.CollaborationPhase.create(payload);
  revalidatePath("/admin/contenu", "layout");
  return;
}

export async function deleteCollaborationPhase(id: string) {
  await requireAdmin();
  await db.orm.public.CollaborationPhase.where((c) => c.id.eq(id)).delete();
  revalidatePath("/admin/contenu", "layout");
  return { ok: true };
}

export { hashIp };

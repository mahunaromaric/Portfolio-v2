import { z } from "zod";

export const publicationStatus = z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]);
export const mediaType = z.enum(["IMAGE", "VIDEO", "DOCUMENT"]);
export const blockType = z.enum(["TEXT", "IMAGE", "IMAGE_GALLERY", "QUOTE", "FEATURES", "TECHNICAL"]);
export const messageStatus = z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]);
export const collaborationPhaseSchema = z.object({
  number: z.coerce.number().int().min(1).max(3),
  title: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(1).max(2000),
  descriptionEn: z.string().trim().max(2000).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().default(0),
  id: z.string().optional(),
});

const urlOrEmpty = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v) || v.startsWith("/"), "URL invalide")
  .optional();

/** Tolère l'oubli du schéma : "github.com/x" → "https://github.com/x". */
export function normalizeUrl(v: unknown): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s) || s.startsWith("/")) return s;
  return `https://${s}`;
}

// ── Profile ──
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(2).max(200),
  location: z.string().trim().max(120).optional(),
  availabilityLabel: z.string().trim().max(120).optional(),
  availabilityLabelEn: z.string().trim().max(120).optional().or(z.literal("")),
  avatarUrl: urlOrEmpty,
  contactEmail: z.string().trim().email().max(255).optional().or(z.literal("")),
});

export const socialLinkSchema = z.object({
  platform: z.string().trim().min(2).max(60),
  url: z.string().trim().min(1).max(2048),
  label: z.string().trim().max(120).optional(),
  displayOrder: z.coerce.number().int().min(0).max(10000).default(0),
});

// ── Categories / Technologies ──
export const projectCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  nameEn: z.string().trim().max(120).optional().or(z.literal("")),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().trim().max(2000).optional(),
  descriptionEn: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const technologyCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const technologySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().trim().max(2048).optional().or(z.literal("")),
  websiteUrl: urlOrEmpty,
  proficiency: z.coerce.number().int().min(1).max(5).optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
});

// ── Projects ──
export const projectSchema = z.object({
  title: z.string().trim().min(2).max(200),
  titleEn: z.string().trim().max(200).optional().or(z.literal("")),
  slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  shortDescription: z.string().trim().min(10).max(2000),
  shortDescriptionEn: z.string().trim().max(2000).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  role: z.string().trim().max(200).optional(),
  roleEn: z.string().trim().max(200).optional().or(z.literal("")),
  status: publicationStatus.default("PUBLISHED"),
  featured: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  liveUrl: urlOrEmpty,
  githubUrl: urlOrEmpty,
  categoryId: z.string().uuid("Catégorie requise"),
  technologyIds: z.array(z.string().uuid()).default([]),
});

export const projectMediaLinkSchema = z.object({
  mediaId: z.string().uuid(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isCover: z.coerce.boolean().default(false),
});

// ── Case study blocks (médias référencés par IDs dans content) ──
const textContent = z.object({ markdown: z.string().min(1).max(20000) });
const imageContent = z.object({ mediaId: z.string().uuid(), caption: z.string().max(500).optional() });
const galleryContent = z.object({
  mediaIds: z.array(z.string().uuid()).min(1).max(12),
  caption: z.string().max(500).optional(),
});
const quoteContent = z.object({ text: z.string().min(1).max(2000), author: z.string().max(200).optional() });
const featuresContent = z.object({ items: z.array(z.string().min(1).max(500)).min(1).max(20) });
const technicalContent = z.object({ points: z.array(z.string().min(1).max(500)).min(1).max(20) });

export const caseStudyBlockSchema = z
  .object({
    type: blockType,
    title: z.string().trim().max(200).optional(),
    displayOrder: z.coerce.number().int().min(0).default(0),
    content: z.unknown().optional(),
  })
  .superRefine((val, ctx) => {
    const parsers = {
      TEXT: textContent,
      IMAGE: imageContent,
      IMAGE_GALLERY: galleryContent,
      QUOTE: quoteContent,
      FEATURES: featuresContent,
      TECHNICAL: technicalContent,
    } as const;
    const result = parsers[val.type].safeParse(val.content);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: `Contenu invalide pour le bloc ${val.type}`, path: ["content"] });
    }
  });

// ── Experience / Education ──
const dateString = z.string().trim().min(1).max(64);

export const experienceSchema = z.object({
  company: z.string().trim().min(2).max(200),
  companyEn: z.string().trim().max(200).optional().or(z.literal("")),
  role: z.string().trim().min(2).max(200),
  roleEn: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional(),
  startDate: dateString,
  endDate: dateString.optional().or(z.literal("")),
  description: z.string().trim().max(10000).optional(),
  descriptionEn: z.string().trim().max(10000).optional().or(z.literal("")),
  status: publicationStatus.default("PUBLISHED"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(2).max(200),
  institutionEn: z.string().trim().max(200).optional().or(z.literal("")),
  program: z.string().trim().min(2).max(200),
  programEn: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional(),
  startDate: dateString,
  endDate: dateString.optional().or(z.literal("")),
  description: z.string().trim().max(10000).optional(),
  descriptionEn: z.string().trim().max(10000).optional().or(z.literal("")),
  status: publicationStatus.default("PUBLISHED"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

// ── Contact public ──
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().regex(/^[\d+\-\s()]{7,20}$/, "Numéro de téléphone invalide"),
  subject: z.string().trim().max(200).optional(),
  content: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

// ── Services ──
export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(120),
  titleEn: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional(),
  descriptionEn: z.string().trim().max(2000).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().default(0),
  status: publicationStatus.default("PUBLISHED"),
});

// ── Auth ──
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export type ProjectInput = z.infer<typeof projectSchema>;

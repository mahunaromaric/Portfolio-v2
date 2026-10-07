"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/prisma/db";
import { requireAdmin } from "@/lib/auth";
import { siteTextKeys } from "@/lib/site-texts";
import { autoTranslateEn } from "@/lib/ai/translate";

const KEYS = new Set(siteTextKeys());

function refresh() {
  revalidateTag("site-texts", "max");
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
}

/** Crée ou met à jour une surcharge. Clé obligatoirement connue du fr.json. */
export async function upsertSiteText(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  const fr = String(formData.get("fr") ?? "").trim();
  let en = String(formData.get("en") ?? "").trim();
  if (!KEYS.has(key)) throw new Error("Clé inconnue.");
  if (!fr) throw new Error("Texte FR requis.");
  if (!en) en = (await autoTranslateEn(fr)) || "";
  const existing = await db.orm.public.SiteText.where((s) => s.key.eq(key)).first();
  if (existing) {
    await db.orm.public.SiteText.where((s) => s.id.eq(existing.id)).update({ fr, en: en || null });
  } else {
    await db.orm.public.SiteText.create({ key, fr, en: en || null });
  }
  refresh();
  return;
}

/** Supprime la surcharge → retour au défaut versionné. */
export async function deleteSiteText(id: string) {
  await requireAdmin();
  await db.orm.public.SiteText.where((s) => s.id.eq(id)).delete();
  refresh();
  return { ok: true };
}

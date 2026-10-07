"use server";

import { requireAdmin } from "@/lib/auth";

export async function translateFRtoEN(text: string): Promise<string> {
  const t = text?.trim();
  if (!t) return "";
  const key = process.env.DEEPL_API_KEY?.trim();
  if (!key) return t;
  const endpoint = key.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate";
  try {
    const body = new URLSearchParams({ text: t, source_lang: "FR", target_lang: "EN" });
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${key}`,
      },
      body,
    });
    if (!res.ok) return t;
    const data = (await res.json()) as { translations?: { text: string }[] };
    const out = data.translations?.[0]?.text?.trim();
    return out || t;
  } catch {
    return t;
  }
}

export async function translateTextAction(formData: FormData): Promise<{ text: string }> {
  await requireAdmin();
  const text = String(formData.get("text") ?? "");
  const out = await translateFRtoEN(text);
  return { text: out };
}

export async function isTranslatorConfigured(): Promise<boolean> {
  return !!process.env.DEEPL_API_KEY?.trim();
}

/**
 * Remplit une cible EN vide depuis son FR. Échec bruyant en prod sans clé,
 * repli FR + avertissement en dev.
 */
export async function autoTranslateEn(fr: string | null | undefined): Promise<string | null> {
  const t = fr?.trim();
  if (!t) return null;
  if (!isTranslatorConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Traduction EN indisponible (clé DeepL manquante).");
    }
    console.warn("[i18n] DEEPL_API_KEY absente — champ EN laissé en français.");
    return t;
  }
  return (await translateFRtoEN(t)) || t;
}

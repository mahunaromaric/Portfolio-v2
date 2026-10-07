import { unstable_cache } from "next/cache";
import { db } from "@/prisma/db";
import frBase from "@/messages/fr.json";
import enBase from "@/messages/en.json";

// Textes du site : JSON versionné par défaut, surcharges DB par-dessus.
// Table vide, clé inconnue ou DB en panne → JSON. La page ne casse jamais.

type Dict = Record<string, unknown>;

const getOverrides = unstable_cache(
  async () => {
    const rows = await db.orm.public.SiteText.limit(1000).all();
    return rows.map((r) => ({ key: r.key as string, fr: r.fr as string, en: (r.en as string | null) ?? null }));
  },
  ["site-texts"],
  { tags: ["site-texts"], revalidate: 300 },
);

function setPath(obj: Dict, key: string, value: string) {
  const parts = key.split(".");
  let cur = obj;
  for (const p of parts.slice(0, -1)) {
    const next = cur[p];
    if (next === null || typeof next !== "object") return;
    cur = next as Dict;
  }
  const last = parts[parts.length - 1]!;
  if (typeof cur[last] === "string") cur[last] = value;
}

export async function getSiteMessages(locale: string): Promise<Dict> {
  const base = JSON.parse(JSON.stringify(locale === "en" ? enBase : frBase)) as Dict;
  try {
    const rows = await getOverrides();
    for (const r of rows) {
      const value = locale === "en" ? r.en || undefined : r.fr;
      if (value) setPath(base, r.key, value);
    }
  } catch {
    // DB injoignable : JSON par défaut.
  }
  return base;
}

/** Clés plates éditables (feuilles string du fr.json). */
export function siteTextKeys(): string[] {
  const out: string[] = [];
  const walk = (obj: Dict, prefix: string) => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") out.push(key);
      else if (v !== null && typeof v === "object" && !Array.isArray(v)) walk(v as Dict, key);
    }
  };
  walk(frBase as unknown as Dict, "");
  return out;
}

/** Valeur par défaut d'une clé (fr + en). */
export function siteTextDefault(key: string): { fr: string; en: string } {
  const get = (obj: Dict) => key.split(".").reduce<unknown>((acc, p) => (acc !== null && typeof acc === "object" ? (acc as Dict)[p] : undefined), obj);
  const fr = get(frBase as unknown as Dict);
  const en = get(enBase as unknown as Dict);
  return { fr: typeof fr === "string" ? fr : "", en: typeof en === "string" ? en : "" };
}

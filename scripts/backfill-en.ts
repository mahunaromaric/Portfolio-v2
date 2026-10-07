import "dotenv/config";
import { db } from "../prisma/db";
import { isTranslatorConfigured, translateFRtoEN } from "../lib/ai/translate";

// Remplit les champs *En vides depuis leur FR via DeepL.
//   npm run i18n:backfill          → dry-run (rapport, aucune écriture)
//   npm run i18n:backfill -- --apply → traduit + écrit

const APPLY = process.argv.includes("--apply");
// --force : inclut aussi les paires où EN == FR (reliquat de l'ancien repli silencieux)

type Row = Record<string, unknown>;
type Job = {
  label: string;
  rows: () => Promise<Row[]>;
  fields: [fr: string, en: string][];
  save: (id: string, patch: Record<string, string | null>) => Promise<unknown>;
};

const asRows = (p: unknown) => p as unknown as Promise<Row[]>;
const upd = (p: unknown) => p as unknown as Promise<unknown>;
const idOf = (r: Row) => r.id as string;
const str = (r: Row, k: string) => (r[k] as string | null | undefined) ?? "";

const JOBS: Job[] = [
  {
    label: "Profile",
    rows: () => asRows(db.orm.public.Profile.limit(10).all()),
    fields: [["headline", "headlineEn"], ["bio", "bioEn"], ["availabilityLabel", "availabilityLabelEn"]],
    save: (id, patch) => upd(db.orm.public.Profile.where((p) => p.id.eq(id)).update(patch)),
  },
  {
    label: "Project",
    rows: () => asRows(db.orm.public.Project.limit(1000).all()),
    fields: [["title", "titleEn"], ["shortDescription", "shortDescriptionEn"], ["role", "roleEn"]],
    save: (id, patch) => upd(db.orm.public.Project.where((p) => p.id.eq(id)).update(patch)),
  },
  {
    label: "ProjectCategory",
    rows: () => asRows(db.orm.public.ProjectCategory.limit(500).all()),
    fields: [["name", "nameEn"], ["description", "descriptionEn"]],
    save: (id, patch) => upd(db.orm.public.ProjectCategory.where((c) => c.id.eq(id)).update(patch)),
  },
  {
    label: "Service",
    rows: () => asRows(db.orm.public.Service.limit(500).all()),
    fields: [["title", "titleEn"], ["description", "descriptionEn"]],
    save: (id, patch) => upd(db.orm.public.Service.where((s) => s.id.eq(id)).update(patch)),
  },
  {
    label: "Experience",
    rows: () => asRows(db.orm.public.Experience.limit(500).all()),
    fields: [["company", "companyEn"], ["role", "roleEn"], ["description", "descriptionEn"]],
    save: (id, patch) => upd(db.orm.public.Experience.where((e) => e.id.eq(id)).update(patch)),
  },
  {
    label: "Education",
    rows: () => asRows(db.orm.public.Education.limit(500).all()),
    fields: [["institution", "institutionEn"], ["program", "programEn"], ["description", "descriptionEn"]],
    save: (id, patch) => upd(db.orm.public.Education.where((e) => e.id.eq(id)).update(patch)),
  },
  {
    label: "CollaborationPhase",
    rows: () => asRows(db.orm.public.CollaborationPhase.limit(100).all()),
    fields: [["title", "titleEn"], ["description", "descriptionEn"]],
    save: (id, patch) => upd(db.orm.public.CollaborationPhase.where((c) => c.id.eq(id)).update(patch)),
  },
];

const icuTokens = (s: string) => s.match(/\{[^}]+\}/g) ?? [];

async function main() {
  // 1. inventaire (sans API)
  const FORCE = process.argv.includes("--force");
  const missing: { job: Job; row: Row; fr: string; en: string; text: string }[] = [];
  for (const job of JOBS) {
    const rows = await job.rows();
    for (const row of rows) {
      for (const [fr, en] of job.fields) {
        const frText = str(row, fr).trim();
        const enText = str(row, en).trim();
        if (frText && (!enText || (FORCE && enText === frText))) {
          missing.push({ job, row, fr, en, text: frText });
        }
      }
    }
  }
  const chars = missing.reduce((s, m) => s + m.text.length, 0);
  console.log(`Champs EN manquants : ${missing.length} (${chars} signes)`);
  if (chars > 400_000) console.warn("⚠ Proche du quota gratuit DeepL (500k signes/mois).");
  if (!APPLY) {
    for (const m of missing.slice(0, 30)) {
      console.log(`  [${m.job.label}] ${m.fr} → ${m.en} : ${m.text.slice(0, 60)}${m.text.length > 60 ? "…" : ""}`);
    }
    if (missing.length > 30) console.log(`  … +${missing.length - 30} autres. Relancez avec -- --apply pour écrire.`);
    else if (missing.length > 0) console.log("Relancez avec -- --apply pour écrire.");
    else console.log("Rien à traduire.");
    process.exit(0);
  }
  if (!(await isTranslatorConfigured())) {
    console.error("DEEPL_API_KEY manquante — impossible d'appliquer.");
    process.exit(1);
  }
  // 2. traduction + écriture
  let ok = 0;
  let flagged = 0;
  for (const m of missing) {
    const out = (await translateFRtoEN(m.text)).trim();
    const lost = icuTokens(m.text).filter((t) => !out.includes(t));
    if (!out || lost.length > 0) {
      flagged++;
      console.warn(`  ✗ [${m.job.label}] ${m.en} ignoré (placeholder perdu : ${lost.join(", ") || "vide"})`);
      continue;
    }
    await m.job.save(idOf(m.row), { [m.en]: out });
    ok++;
    console.log(`  ✓ [${m.job.label}] ${m.en}`);
  }
  console.log(`Terminé : ${ok} traduits, ${flagged} ignorés.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

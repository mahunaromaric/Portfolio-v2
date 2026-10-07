import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isTranslatorConfigured, translateFRtoEN } from "../lib/ai/translate";

// Synchronise messages/en.json depuis messages/fr.json : traduit les clés manquantes,
// ne touche jamais aux clés existantes (le manuel prime).
//   npm run i18n:sync          → dry-run (rapport)
//   npm run i18n:sync -- --apply → traduit + écrit

const APPLY = process.argv.includes("--apply");
const dir = path.dirname(fileURLToPath(import.meta.url));
const FR_PATH = path.join(dir, "../messages/fr.json");
const EN_PATH = path.join(dir, "../messages/en.json");

type Dict = Record<string, unknown>;
const isStr = (v: unknown): v is string => typeof v === "string";
const icuTokens = (s: string) => s.match(/\{[^}]+\}/g) ?? [];

async function main() {
  const fr = JSON.parse(fs.readFileSync(FR_PATH, "utf8")) as Dict;
  const en = JSON.parse(fs.readFileSync(EN_PATH, "utf8")) as Dict;
  const missing: { key: string; text: string }[] = [];

  const walk = (f: Dict, e: Dict, prefix: string) => {
    for (const [k, v] of Object.entries(f)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        if (e[k] === null || typeof e[k] !== "object" || Array.isArray(e[k])) e[k] = {};
        walk(v as Dict, e[k] as Dict, key);
      } else if (isStr(v)) {
        if (!isStr(e[k]) || !e[k].trim()) missing.push({ key, text: v });
      }
    }
  };
  walk(fr, en, "");

  const chars = missing.reduce((s, m) => s + m.text.length, 0);
  console.log(`Clés EN manquantes : ${missing.length} (${chars} signes)`);
  if (!APPLY) {
    for (const m of missing.slice(0, 30)) console.log(`  ${m.key} : ${m.text.slice(0, 70)}`);
    if (missing.length > 0) console.log("Relancez avec -- --apply pour écrire.");
    process.exit(0);
  }
  if (missing.length === 0) process.exit(0);
  if (!(await isTranslatorConfigured())) {
    console.error("DEEPL_API_KEY manquante — impossible d'appliquer.");
    process.exit(1);
  }
  const set = (obj: Dict, key: string, value: string) => {
    const parts = key.split(".");
    let cur = obj;
    for (const p of parts.slice(0, -1)) cur = cur[p] as Dict;
    cur[parts[parts.length - 1]!] = value;
  };
  let ok = 0;
  for (const m of missing) {
    const out = (await translateFRtoEN(m.text)).trim();
    const lost = icuTokens(m.text).filter((t) => !out.includes(t));
    if (!out || lost.length > 0) {
      console.warn(`  ✗ ${m.key} ignoré (placeholder perdu)`);
      continue;
    }
    set(en, m.key, out);
    ok++;
    console.log(`  ✓ ${m.key}`);
  }
  fs.writeFileSync(EN_PATH, JSON.stringify(en, null, 2) + "\n");
  console.log(`Écrit : ${ok} clés dans messages/en.json.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

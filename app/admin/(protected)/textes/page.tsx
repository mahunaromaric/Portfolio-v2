import Link from "next/link";
import { db } from "@/prisma/db";
import { upsertSiteText, deleteSiteText } from "@/lib/actions/site-texts";
import { siteTextKeys, siteTextDefault } from "@/lib/site-texts";
import { DeleteButton } from "@/components/admin-ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TranslateButton } from "@/components/admin/TranslateButton";

export const dynamic = "force-dynamic";

const input = "rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none";

export default async function AdminTextesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ns?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const keys = siteTextKeys();
  const namespaces = [...new Set(keys.map((k) => k.split(".")[0]!))].sort();
  const ns = sp.ns && namespaces.includes(sp.ns) ? sp.ns : "ALL";
  const overrides = await db.orm.public.SiteText.limit(1000).all();
  const byKey = new Map(overrides.map((o) => [o.key as string, o]));
  const filtered = keys.filter((k) => {
    if (ns !== "ALL" && !k.startsWith(`${ns}.`)) return false;
    if (!q) return true;
    const d = siteTextDefault(k);
    return k.toLowerCase().includes(q) || d.fr.toLowerCase().includes(q) || d.en.toLowerCase().includes(q);
  });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">
        Textes du site <span className="text-sm text-muted">({filtered.length}/{keys.length})</span>
      </h1>
      <p className="max-w-2xl text-sm text-secondary">
        Surcharge les textes de <span className="font-mono text-xs">messages/*.json</span> (défauts versionnés).
        Vide = défaut. Supprimer une surcharge revient au défaut — les clés ne se créent ni ne se suppriment.
      </p>
      <form method="get" className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold text-secondary">Recherche
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Clé ou contenu…" aria-label="Rechercher" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary">Section
          <select name="ns" defaultValue={ns} aria-label="Filtrer par section" className={input}>
            <option value="ALL">Toutes</option>
            {namespaces.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-black">Filtrer</button>
        {(q || ns !== "ALL") && <Link href="/admin/textes" className="rounded-full border border-border bg-bg px-4 py-2 text-sm font-bold text-ink hover:bg-surface">Réinitialiser</Link>}
      </form>
      <div className="flex flex-col gap-2">
        {filtered.map((key) => {
          const d = siteTextDefault(key);
          const o = byKey.get(key);
          const fr = (o?.fr as string | undefined) ?? d.fr;
          const en = ((o?.en as string | null | undefined) ?? d.en) || "";
          const modified = !!o;
          return (
            <div key={key} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-ink break-all">{key}</span>
                {modified ? (
                  <span className="rounded-full bg-clay/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-clayHover dark:text-clay">Modifié</span>
                ) : (
                  <span className="rounded-full bg-bg px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-muted">Défaut</span>
                )}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-bold text-accent">Éditer</summary>
                <ActionForm action={upsertSiteText} successMessage="Texte enregistré." className="mt-2 grid grid-cols-1 gap-2">
                  <input type="hidden" name="key" value={key} />
                  <label className="flex flex-col gap-1 text-xs font-bold text-secondary">Français
                    <textarea name="fr" required defaultValue={fr} rows={2} aria-label={`${key} en français`} className={input} />
                  </label>
                  <div className="flex gap-2">
                    <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold text-secondary">Anglais (auto si vide)
                      <textarea name="en" defaultValue={en} rows={2} aria-label={`${key} en anglais`} className={`${input} w-full`} />
                    </label>
                    <span className="self-end"><TranslateButton sourceName="fr" targetName="en" /></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SubmitButton pendingLabel="…" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-black">Enregistrer</SubmitButton>
                    {modified && <DeleteButton label="Réinitialiser" confirmMessage={`Revenir au défaut pour ${key} ?`} onDelete={deleteSiteText.bind(null, o!.id as string)} />}
                  </div>
                </ActionForm>
              </details>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted">Aucune clé.</p>}
      </div>
    </div>
  );
}

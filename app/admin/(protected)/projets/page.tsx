import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { adminList } from "@/lib/dal/admin";
import { upsertProject, deleteProject } from "@/lib/actions/projects";
import { DeleteButton } from "@/components/admin-ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { SubmitButton } from "@/components/admin/SubmitButton";

export const dynamic = "force-dynamic";

const input = "rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none";

export default async function AdminProjetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = ["DRAFT", "PUBLISHED", "HIDDEN"].includes((sp.status ?? "").toUpperCase())
    ? (sp.status as string).toUpperCase()
    : "ALL";
  const [projects, categories, technologies] = await Promise.all([adminList.projects(), adminList.categories(), adminList.technologies()]);
  const filtered = projects.filter((p) => {
    if (status !== "ALL" && p.status !== status) return false;
    if (!q) return true;
    return [p.title, p.slug].some((v) => (v ?? "").toLowerCase().includes(q));
  });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Projets <span className="text-sm font-bold text-muted">({projects.length})</span></h1>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-ink">Nouveau projet</h2>
        <ActionForm action={upsertProject} successMessage="Projet enregistré." className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input name="title" required placeholder="Titre *" aria-label="Titre *" className={input} />
          <input name="titleEn" placeholder="Titre EN" aria-label="Titre EN" className={input} />
          <input name="slug" placeholder="slug (auto si vide)" aria-label="slug (auto si vide)" className={input} />
          <input name="shortDescription" required placeholder="Description courte *" aria-label="Description courte *" className={`${input} md:col-span-2`} />
          <input name="shortDescriptionEn" placeholder="Description courte EN" aria-label="Description courte EN" className={`${input} md:col-span-2`} />
          <select name="categoryId" required aria-label="Catégorie" className={input} defaultValue="">
            <option value="" disabled>Catégorie *</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="role" placeholder="Rôle (ex: Full-Stack)" aria-label="Rôle (ex: Full-Stack)" className={input} />
          <input name="roleEn" placeholder="Rôle EN" aria-label="Rôle EN" className={input} />
          <input name="year" type="number" placeholder="Année" aria-label="Année" className={input} />
          <input name="displayOrder" type="number" defaultValue={0} placeholder="Ordre" aria-label="Ordre" className={input} />
          <select name="status" aria-label="Statut" className={input} defaultValue="PUBLISHED"><option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option></select>
          <input name="liveUrl" placeholder="URL live (https://…)" aria-label="URL live (https://…)" className={input} />
          <input name="githubUrl" placeholder="URL GitHub" aria-label="URL GitHub" className={input} />
          <label className="flex items-center gap-2 text-sm font-medium text-secondary"><input name="featured" type="checkbox" /> Mis en avant</label>
          <fieldset className="md:col-span-2 rounded-xl border border-border bg-bg p-3">
            <legend className="px-2 text-xs font-bold text-secondary">Technologies (coche)</legend>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {technologies.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name="technologyIds" value={t.id} className="rounded border-border text-accent focus:ring-accent" />
                  {t.name}
                </label>
              ))}
              {technologies.length===0 && <span className="text-xs text-muted">Aucune — crée-les dans Contenu</span>}
            </div>
          </fieldset>
          <SubmitButton pendingLabel="Création…" className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-black md:col-span-2 flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" /> Créer</SubmitButton>
        </ActionForm>
      </section>

      <section className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <form method="get" className="flex flex-wrap items-end gap-2 border-b border-border p-4">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold text-secondary">Recherche
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Titre, slug…" aria-label="Rechercher" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-secondary">Statut
            <select name="status" defaultValue={status} aria-label="Filtrer par statut" className={input}>
              <option value="ALL">Tous</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="HIDDEN">HIDDEN</option>
            </select>
          </label>
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-black">Filtrer</button>
          {(q || status !== "ALL") && <Link href="/admin/projets" className="rounded-full border border-border bg-bg px-4 py-2 text-sm font-bold text-ink hover:bg-surface">Réinitialiser</Link>}
        </form>
        <div className="divide-y divide-border">
          {filtered.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-bg/50">
              <div className="min-w-0">
                <div className="font-bold text-ink truncate">{p.title} <span className="text-xs font-normal text-muted">/{p.slug}</span></div>
                <div className="text-xs text-secondary">{p.status} {p.featured ? "★" : ""} · {p.category.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <MoveButtons table="Project" id={p.id} />
                <Link href={`/admin/projets/${p.id}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-bold text-ink hover:bg-surface"><Pencil className="h-3 w-3" /> Éditer</Link>
                <DeleteButton onDelete={deleteProject.bind(null, p.id)} />
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="p-8 text-center text-sm text-muted">Aucun projet.</div>}
        </div>
        <div className="p-3 text-xs text-muted flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {filtered.length}/{projects.length} projets au total</div>
      </section>
    </div>
  );
}

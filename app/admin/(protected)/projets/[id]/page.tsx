import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import { adminList } from "@/lib/dal/admin";
import { upsertProject } from "@/lib/actions/projects";
import { ensureCaseStudy, upsertCaseStudyBlock, deleteCaseStudyBlock } from "@/lib/actions/projects";
import { linkProjectMedia, unlinkProjectMedia } from "@/lib/actions/media";
import { DeleteButton } from "@/components/admin-ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";

export const dynamic = "force-dynamic";
const input = "rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none";

export default async function EditProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await db.orm.public.Project.where((p) => p.id.eq(id)).first();
  if (!project) notFound();
  const [categories, technologies, mediaLinks, allMedia, caseStudy] = await Promise.all([
    adminList.categories(), adminList.technologies(),
    db.orm.public.ProjectMedia.where((m) => m.projectId.eq(id)).orderBy((m) => m.displayOrder.asc()).all(),
    adminList.media(),
    db.orm.public.CaseStudy.where((c) => c.projectId.eq(id)).first(),
  ]);
  const currentTechIds = (await db.orm.public.ProjectTechnology.where((t) => t.projectId.eq(id)).all()).map((t) => t.technologyId);
  const blocks = caseStudy ? await db.orm.public.CaseStudyBlock.where((b) => b.caseStudyId.eq(caseStudy.id)).orderBy((b) => b.displayOrder.asc()).all() : [];
  const linkedMedia = await Promise.all(mediaLinks.map(async (l) => ({ link: l, media: await db.orm.public.Media.where((m) => m.id.eq(l.mediaId)).first() })));

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink break-words truncate">Éditer : {project.title}</h1>

      <ActionForm action={upsertProject} successMessage="Projet enregistré." className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm md:grid-cols-2">
        <input type="hidden" name="id" value={project.id} />
        <input name="title" required defaultValue={project.title} className={input} />
        <input name="titleEn" defaultValue={project.titleEn ?? ""} placeholder="Titre EN" aria-label="Titre EN" className={input} />
        <input name="slug" defaultValue={project.slug} className={input} />
        <input name="shortDescription" required defaultValue={project.shortDescription} className={`${input} md:col-span-2`} />
        <input name="shortDescriptionEn" defaultValue={project.shortDescriptionEn ?? ""} placeholder="Description courte EN" aria-label="Description courte EN" className={`${input} md:col-span-2`} />
        <select name="categoryId" required aria-label="Catégorie" defaultValue={project.categoryId} className={input}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input name="role" defaultValue={project.role ?? ""} placeholder="Rôle" aria-label="Rôle" className={input} />
        <input name="roleEn" defaultValue={project.roleEn ?? ""} placeholder="Rôle EN" aria-label="Rôle EN" className={input} />
        <input name="year" type="number" defaultValue={project.year ?? ""} placeholder="Année" aria-label="Année" className={input} />
        <input name="displayOrder" type="number" defaultValue={project.displayOrder} className={input} />
        <select name="status" aria-label="Statut" defaultValue={project.status} className={input}><option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option></select>
        <input name="liveUrl" defaultValue={project.liveUrl ?? ""} placeholder="Live URL" aria-label="Live URL" className={input} />
        <input name="githubUrl" defaultValue={project.githubUrl ?? ""} placeholder="GitHub" aria-label="GitHub" className={input} />
        <label className="flex items-center gap-2 text-sm font-medium text-secondary"><input name="featured" type="checkbox" defaultChecked={project.featured} /> Mis en avant</label>
        <fieldset className="md:col-span-2 rounded-xl border border-border bg-bg p-3">
          <legend className="px-2 text-xs font-bold text-secondary">Technologies (coche)</legend>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {technologies.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="technologyIds" value={t.id} defaultChecked={currentTechIds.includes(t.id)} className="rounded border-border text-accent focus:ring-accent" />
                {t.name}
              </label>
            ))}
            {technologies.length===0 && <span className="text-xs text-muted">Aucune — crée-les dans Contenu</span>}
          </div>
        </fieldset>
        <SubmitButton pendingLabel="Enregistrement…" className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-black md:col-span-2">Enregistrer</SubmitButton>
      </ActionForm>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-ink">Médias liés</h2>
        <div className="mb-3 flex flex-col gap-2">
          {linkedMedia.map(({ link, media }) => media ? (
            <div key={link.mediaId} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg p-3 text-sm"><span className="truncate text-ink">{media.url} {link.isCover ? "★ cover" : ""}</span><DeleteButton label="Détacher" onDelete={unlinkProjectMedia.bind(null, id, link.mediaId)} /></div>
          ) : null)}
          {linkedMedia.length===0 && <p className="text-sm text-muted">Aucun média lié.</p>}
        </div>
        <ActionForm successMessage="Média lié." action={async (fd: FormData) => { "use server"; await linkProjectMedia(id, fd.get("mediaId") as string, { isCover: fd.get("isCover")==="on" }); }} className="flex flex-wrap gap-2">
          <select name="mediaId" required aria-label="Média à lier" className={input} defaultValue=""><option value="" disabled>Choisir un média</option>{allMedia.map((m) => <option key={m.id} value={m.id}>{m.url}</option>)}</select>
          <label className="flex items-center gap-2 text-sm font-medium text-secondary"><input name="isCover" type="checkbox" /> Cover</label>
          <SubmitButton pendingLabel="…" className="rounded-full border border-border bg-bg px-4 py-2 text-xs font-bold text-ink hover:bg-surface">Lier</SubmitButton>
        </ActionForm>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-ink">Étude de cas</h2>
        {!caseStudy ? (
          <ActionForm successMessage="Étude de cas créée." action={async () => { "use server"; await ensureCaseStudy(id); }}><SubmitButton pendingLabel="…" className="rounded-full border border-border bg-bg px-4 py-2 text-xs font-bold text-ink">Créer l&apos;étude de cas</SubmitButton></ActionForm>
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-2">
              {blocks.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg p-3 text-sm"><span className="min-w-0 flex-1 truncate break-all text-ink">[{b.type}] {b.title ?? "(sans titre)"} — ordre {b.displayOrder}</span><span className="shrink-0"><DeleteButton label="Supprimer" onDelete={deleteCaseStudyBlock.bind(null, b.id)} /></span></div>
              ))}
              {blocks.length===0 && <p className="text-sm text-muted">Aucun bloc.</p>}
            </div>
            <BlockEditor caseStudyId={caseStudy.id} order={blocks.length} media={allMedia} />
          </>
        )}
      </section>
    </div>
  );
}

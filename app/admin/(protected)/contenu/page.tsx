import { db } from "@/prisma/db";
import { adminList } from "@/lib/dal/admin";
import {
  upsertProfile, upsertSocialLink, deleteSocialLink,
  upsertExperience, deleteExperience, upsertEducation, deleteEducation,
  upsertService, deleteService,
  upsertCollaborationPhase, deleteCollaborationPhase,
} from "@/lib/actions/content";
import { upsertProjectCategory, deleteProjectCategory, upsertTechnology, deleteTechnology, upsertTechnologyCategory, deleteTechnologyCategory } from "@/lib/actions/projects";
import { DeleteButton } from "@/components/admin-ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TranslateButton } from "@/components/admin/TranslateButton";

export const dynamic = "force-dynamic";

const input = "rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none";
const section = "rounded-2xl border border-border bg-surface p-4 shadow-sm";
const h2 = "mb-3 font-bold tracking-tight text-ink";

export default async function AdminContenuPage() {
  const [profile, categories, techCats, technos, exps, edus, services, collaborationPhases] = await Promise.all([
    db.orm.public.Profile.limit(1).all().then((r) => r[0] ?? null),
    adminList.categories(),
    adminList.techCategories(),
    adminList.technologies(),
    adminList.experiences(),
    adminList.educations(),
    adminList.services(),
    adminList.collaborationPhases(),
  ]);
  const socialLinks = profile
    ? await db.orm.public.SocialLink.where((s) => s.profileId.eq(profile.id)).orderBy((s) => s.displayOrder.asc()).all()
    : [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Contenu</h1>

      <section className={section}>
        <h2 className={h2}>Profil</h2>
        <ActionForm action={upsertProfile} successMessage="Profil enregistré." className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <input name="name" required defaultValue={profile?.name ?? ""} placeholder="Nom *" aria-label="Nom *" className={input} />
          <input name="headline" required defaultValue={profile?.headline ?? ""} placeholder="Titre *" aria-label="Titre *" className={input} />
          <input name="location" defaultValue={profile?.location ?? ""} placeholder="Localisation" aria-label="Localisation" className={input} />
          <input name="availabilityLabel" defaultValue={profile?.availabilityLabel ?? ""} placeholder="Disponibilité" aria-label="Disponibilité" className={input} />
          <input name="availabilityLabelEn" defaultValue={profile?.availabilityLabelEn ?? ""} placeholder="Disponibilité EN" aria-label="Disponibilité EN" className={input} />
          <input name="avatarUrl" defaultValue={profile?.avatarUrl ?? ""} placeholder="URL avatar" aria-label="URL avatar" className={input} />
          <input name="contactEmail" defaultValue={profile?.contactEmail ?? ""} placeholder="Email contact" aria-label="Email contact" className={`${input} md:col-span-2`} />
          <SubmitButton pendingLabel="Enregistrement…" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-black md:col-span-2">Enregistrer</SubmitButton>
        </ActionForm>
        {profile && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold">Liens sociaux</h3>
            <ul className="mb-2 flex flex-col gap-1 text-sm">
              {socialLinks.map((s) => (
                <li key={s.id} className="rounded-xl border border-border bg-bg">
                  <div className="flex items-center justify-between gap-2 p-2.5">
                    <details className="min-w-0 flex-1">
                      <summary className="cursor-pointer truncate">{s.platform} — {s.url} <span className="font-bold text-accent">· Éditer</span></summary>
                      <ActionForm action={upsertSocialLink} successMessage="Lien enregistré." className="mt-2 grid grid-cols-1 gap-2">
                        <input type="hidden" name="id" value={s.id} />
                        <input name="platform" required defaultValue={s.platform} aria-label="Plateforme" className={input} />
                        <input name="url" required defaultValue={s.url} aria-label="URL" className={input} />
                        <input name="displayOrder" type="number" defaultValue={s.displayOrder} aria-label="Ordre" className={input} />
                        <SubmitButton pendingLabel="…" className="w-fit rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink">Enregistrer</SubmitButton>
                      </ActionForm>
                    </details>
                    <span className="shrink-0"><DeleteButton label="Retirer" onDelete={deleteSocialLink.bind(null, s.id)} /></span>
                  </div>
                </li>
              ))}
              {socialLinks.length===0 && <li className="text-sm text-muted">Aucun lien.</li>}
            </ul>
            <ActionForm action={upsertSocialLink} successMessage="Lien ajouté." className="flex flex-wrap gap-2">
              <input type="hidden" name="profileId" value={profile.id} />
              <input name="platform" required placeholder="Plateforme (GitHub…)" aria-label="Plateforme (GitHub…)" className={input} />
              <input name="url" required placeholder="https://…" aria-label="https://…" className={input} />
              <input name="displayOrder" type="number" defaultValue={socialLinks.length} className={input} />
              <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface">Ajouter</SubmitButton>
            </ActionForm>
          </div>
        )}
      </section>

      <section className={section}>
        <h2 className={h2}>Collaboration</h2>
        <ul className="mb-2 flex flex-col gap-1 text-sm">
          {collaborationPhases.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-bg">
              <div className="flex items-center justify-between gap-2 p-2.5">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer truncate">{c.number}. {c.title} — {c.description.slice(0, 60)}… <span className="font-bold text-accent">· Éditer</span></summary>
                  <ActionForm action={upsertCollaborationPhase} successMessage="Phase enregistrée." className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="number" type="number" min={1} max={3} required defaultValue={c.number} aria-label="Numéro" className={input} />
                    <input name="title" required defaultValue={c.title} aria-label="Titre" className={input} />
                    <input name="displayOrder" type="number" defaultValue={c.displayOrder} aria-label="Ordre" className={input} />
                    <div className="flex gap-2 md:col-span-3">
                      <input name="titleEn" defaultValue={c.titleEn ?? ""} aria-label="Titre EN" className={`${input} flex-1`} />
                      <TranslateButton sourceName="title" targetName="titleEn" />
                    </div>
                    <textarea name="description" required defaultValue={c.description} rows={2} aria-label="Description" className={`${input} md:col-span-3`} />
                    <div className="flex gap-2 md:col-span-3">
                      <textarea name="descriptionEn" defaultValue={c.descriptionEn ?? ""} rows={2} aria-label="Description EN" className={`${input} flex-1`} />
                      <TranslateButton sourceName="description" targetName="descriptionEn" />
                    </div>
                    <SubmitButton pendingLabel="…" className="w-fit rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink md:col-span-3">Enregistrer</SubmitButton>
                  </ActionForm>
                </details>
                <span className="flex shrink-0 items-center gap-1"><MoveButtons table="CollaborationPhase" id={c.id} /><DeleteButton label="Retirer" onDelete={deleteCollaborationPhase.bind(null, c.id)} /></span>
              </div>
            </li>
          ))}
          {collaborationPhases.length===0 && <li className="text-sm text-muted">Aucune phase.</li>}
        </ul>
        <ActionForm action={upsertCollaborationPhase} successMessage="Phase enregistrée." className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input name="number" type="number" min={1} max={3} required placeholder="N° (1-3)" aria-label="N° (1-3)" className={input} />
          <input name="title" required placeholder="Titre * FR" aria-label="Titre * FR" className={input} />
          <input name="displayOrder" type="number" defaultValue={collaborationPhases.length} className={input} />
          <div className="flex gap-2 md:col-span-3">
            <input name="titleEn" placeholder="Title EN (auto DeepL)" aria-label="Title EN (auto DeepL)" className={`${input} flex-1`} />
            <TranslateButton sourceName="title" targetName="titleEn" />
          </div>
          <textarea name="description" required placeholder="Description * FR" aria-label="Description * FR" rows={2} className={`${input} md:col-span-3`} />
          <div className="flex gap-2 md:col-span-3">
            <textarea name="descriptionEn" placeholder="Description EN (auto)" aria-label="Description EN (auto)" rows={2} className={`${input} flex-1`} />
            <TranslateButton sourceName="description" targetName="descriptionEn" />
          </div>
          <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface md:col-span-3">Ajouter phase</SubmitButton>
        </ActionForm>
      </section>

      <section className={section}>
        <h2 className={h2}>Catégories de projets</h2>
        <ul className="mb-2 flex flex-col gap-1 text-sm">
              {categories.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-bg">
              <div className="flex items-center justify-between gap-2 p-2.5">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer truncate">{c.name} /{c.slug} <span className="font-bold text-accent">· Éditer</span></summary>
                  <ActionForm action={upsertProjectCategory} successMessage="Catégorie enregistrée." className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="name" required defaultValue={c.name} aria-label="Nom" className={input} />
                    <input name="nameEn" defaultValue={c.nameEn ?? ""} aria-label="Nom EN" className={input} />
                    <input name="slug" defaultValue={c.slug} aria-label="Slug" className={input} />
                    <SubmitButton pendingLabel="…" className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink">Enregistrer</SubmitButton>
                  </ActionForm>
                </details>
                <span className="shrink-0"><DeleteButton label="Retirer" onDelete={deleteProjectCategory.bind(null, c.id)} /></span>
              </div>
            </li>
          ))}
          {categories.length===0 && <li className="text-sm text-muted">Aucune catégorie.</li>}
        </ul>
        <ActionForm action={upsertProjectCategory} successMessage="Catégorie enregistrée." className="flex flex-wrap gap-2">
          <input name="name" required placeholder="Nom *" aria-label="Nom *" className={input} />
          <input name="nameEn" placeholder="Nom EN" aria-label="Nom EN" className={input} />
          <input name="slug" placeholder="slug (auto)" aria-label="slug (auto)" className={input} />
          <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface">Ajouter</SubmitButton>
        </ActionForm>
      </section>

      <section className={section}>
        <h2 className={h2}>Catégories technos + Technologies</h2>
        <div className="mb-3 flex flex-wrap gap-2 text-sm">
          {techCats.map((c) => (
            <details key={c.id} className="rounded border border-border bg-bg">
              <summary className="cursor-pointer px-2 py-1">{c.name} /{c.slug} (ordre {c.displayOrder}) <span className="font-bold text-accent">· Éditer</span></summary>
              <ActionForm action={upsertTechnologyCategory} successMessage="Catégorie enregistrée." className="flex flex-wrap gap-2 border-t border-border p-2">
                <input type="hidden" name="id" value={c.id} />
                <input name="name" required defaultValue={c.name} aria-label="Nom" className={input} />
                <input name="displayOrder" type="number" defaultValue={c.displayOrder} aria-label="Ordre" className={input} />
                <SubmitButton pendingLabel="…" className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink">Enregistrer</SubmitButton>
                <DeleteButton label="Retirer" onDelete={deleteTechnologyCategory.bind(null, c.id)} />
              </ActionForm>
            </details>
          ))}
          {techCats.length===0 && <span className="text-sm text-muted">Aucune catégorie.</span>}
        </div>
        <ActionForm action={upsertTechnologyCategory} successMessage="Catégorie techno enregistrée." className="mb-4 flex flex-wrap gap-2">
          <input name="name" required placeholder="Nouvelle catégorie *" aria-label="Nouvelle catégorie *" className={input} />
          <input name="displayOrder" type="number" defaultValue={techCats.length} className={input} />
          <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface">Ajouter catégorie</SubmitButton>
        </ActionForm>
        <ul className="mb-2 flex flex-col gap-1 text-sm">
          {technos.map((t) => (
            <li key={t.id} className="rounded-xl border border-border bg-bg">
              <div className="flex items-center justify-between gap-2 p-2.5">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer truncate">{t.name} /{t.slug}{t.proficiency ? ` · niveau ${t.proficiency}/5` : ""} <span className="font-bold text-accent">· Éditer</span></summary>
                  <ActionForm action={upsertTechnology} successMessage="Techno enregistrée." className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={t.id} />
                    <input name="name" required defaultValue={t.name} aria-label="Nom" className={input} />
                    <select name="categoryId" defaultValue={t.categoryId ?? ""} aria-label="Catégorie techno" className={input}>
                      <option value="">Sans catégorie</option>
                      {techCats.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <input name="icon" defaultValue={t.icon ?? ""} aria-label="Icône" className={input} />
                    <input name="proficiency" type="number" min={1} max={5} defaultValue={t.proficiency ?? ""} aria-label="Niveau 1-5" className={input} />
                    <SubmitButton pendingLabel="…" className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink">Enregistrer</SubmitButton>
                  </ActionForm>
                </details>
                <span className="shrink-0"><DeleteButton label="Retirer" onDelete={deleteTechnology.bind(null, t.id)} /></span>
              </div>
            </li>
          ))}
          {technos.length===0 && <li className="text-sm text-muted">Aucune techno.</li>}
        </ul>
        <ActionForm action={upsertTechnology} successMessage="Techno enregistrée." className="flex flex-wrap gap-2">
          <input name="name" required placeholder="Nom techno *" aria-label="Nom techno *" className={input} />
          <select name="categoryId" aria-label="Catégorie techno" className={input} defaultValue="">
            <option value="">Sans catégorie</option>
            {techCats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input name="icon" placeholder="Icône : https://cdn.simpleicons.org/react/1c1917 ou /icons/react.svg" aria-label="Icône : https://cdn.simpleicons.org/react/1c1917 ou /icons/react.svg" className={`${input} w-full sm:min-w-[260px]`} />
          <input name="proficiency" type="number" min={1} max={5} placeholder="Niveau 1-5" aria-label="Niveau 1-5" className={input} />
          <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface">Ajouter techno</SubmitButton>
        </ActionForm>
      </section>

      <section className={section}>
        <h2 className={h2}>Expériences</h2>
        <ul className="mb-2 flex flex-col gap-1 text-sm">
          {exps.map((e) => (
            <li key={e.id} className="rounded-xl border border-border bg-bg">
              <div className="flex items-center justify-between gap-2 p-2.5">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer truncate">{e.role} @ {e.company} [{e.status}]{e.status === "PUBLISHED" && exps.filter((x) => x.status === "PUBLISHED").findIndex((x) => x.id === e.id) >= 4 && <span title="Seules les 4 premières expériences publiées (ordre croissant) sont affichées" className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Non affiché</span>} <span className="font-bold text-accent">· Éditer</span></summary>
                  <ActionForm action={upsertExperience} successMessage="Expérience enregistrée." className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input type="hidden" name="id" value={e.id} />
                    <input name="company" required defaultValue={e.company} aria-label="Entreprise" className={input} />
                    <input name="companyEn" defaultValue={e.companyEn ?? ""} aria-label="Entreprise EN" className={input} />
                    <input name="role" required defaultValue={e.role} aria-label="Rôle" className={input} />
                    <input name="roleEn" defaultValue={e.roleEn ?? ""} aria-label="Rôle EN" className={input} />
                    <input name="location" defaultValue={e.location ?? ""} aria-label="Lieu" className={input} />
                    <input name="startDate" required defaultValue={e.startDate} aria-label="Début" className={input} />
                    <input name="endDate" defaultValue={e.endDate ?? ""} aria-label="Fin" className={input} />
                    <select name="status" defaultValue={e.status} aria-label="Statut" className={input}>
                      <option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option>
                    </select>
                    <textarea name="description" defaultValue={e.description ?? ""} rows={2} aria-label="Description" className={`${input} md:col-span-3`} />
                    <textarea name="descriptionEn" defaultValue={e.descriptionEn ?? ""} rows={2} aria-label="Description EN" className={`${input} md:col-span-3`} />
                    <SubmitButton pendingLabel="…" className="w-fit rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink md:col-span-3">Enregistrer</SubmitButton>
                  </ActionForm>
                </details>
                <span className="flex shrink-0 items-center gap-1"><MoveButtons table="Experience" id={e.id} /><DeleteButton label="Retirer" onDelete={deleteExperience.bind(null, e.id)} /></span>
              </div>
            </li>
          ))}
          {exps.length===0 && <li className="text-sm text-muted">Aucune expérience.</li>}
        </ul>
        <ActionForm action={upsertExperience} successMessage="Expérience enregistrée." className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input name="company" required placeholder="Entreprise *" aria-label="Entreprise *" className={input} />
          <input name="companyEn" placeholder="Entreprise EN" aria-label="Entreprise EN" className={input} />
          <input name="role" required placeholder="Rôle *" aria-label="Rôle *" className={input} />
          <input name="roleEn" placeholder="Rôle EN" aria-label="Rôle EN" className={input} />
          <input name="location" placeholder="Lieu" aria-label="Lieu" className={input} />
          <input name="startDate" required placeholder="Début (2023-01-01)" aria-label="Début (2023-01-01)" className={input} />
          <input name="endDate" placeholder="Fin (vide = en cours)" aria-label="Fin (vide = en cours)" className={input} />
          <select name="status" aria-label="Statut" className={input} defaultValue="PUBLISHED">
            <option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option>
          </select>
          <textarea name="description" placeholder="Description FR" aria-label="Description FR" rows={2} className={`${input} md:col-span-3`} />
          <textarea name="descriptionEn" placeholder="Description EN" aria-label="Description EN" rows={2} className={`${input} md:col-span-3`} />
          <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface md:col-span-3">Ajouter expérience</SubmitButton>
        </ActionForm>
      </section>

      <section className={section}>
        <h2 className={h2}>Formations</h2>
        <ul className="mb-2 flex flex-col gap-1 text-sm">
          {edus.map((e) => (
            <li key={e.id} className="rounded-xl border border-border bg-bg">
              <div className="flex items-center justify-between gap-2 p-2.5">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer truncate">{e.program} @ {e.institution} [{e.status}]{e.status === "PUBLISHED" && edus.filter((x) => x.status === "PUBLISHED").findIndex((x) => x.id === e.id) >= 1 && <span title="Seule la première formation publiée (ordre croissant) est affichée" className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Non affiché</span>} <span className="font-bold text-accent">· Éditer</span></summary>
                  <ActionForm action={upsertEducation} successMessage="Formation enregistrée." className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input type="hidden" name="id" value={e.id} />
                    <input name="institution" required defaultValue={e.institution} aria-label="Établissement" className={input} />
                    <input name="institutionEn" defaultValue={e.institutionEn ?? ""} aria-label="Établissement EN" className={input} />
                    <input name="program" required defaultValue={e.program} aria-label="Programme" className={input} />
                    <input name="programEn" defaultValue={e.programEn ?? ""} aria-label="Programme EN" className={input} />
                    <input name="startDate" required defaultValue={e.startDate} aria-label="Début" className={input} />
                    <input name="endDate" defaultValue={e.endDate ?? ""} aria-label="Fin" className={input} />
                    <select name="status" defaultValue={e.status} aria-label="Statut" className={input}>
                      <option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option>
                    </select>
                    <textarea name="description" defaultValue={e.description ?? ""} rows={2} aria-label="Description" className={`${input} md:col-span-3`} />
                    <textarea name="descriptionEn" defaultValue={e.descriptionEn ?? ""} rows={2} aria-label="Description EN" className={`${input} md:col-span-3`} />
                    <SubmitButton pendingLabel="…" className="w-fit rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink md:col-span-3">Enregistrer</SubmitButton>
                  </ActionForm>
                </details>
                <span className="flex shrink-0 items-center gap-1"><MoveButtons table="Education" id={e.id} /><DeleteButton label="Retirer" onDelete={deleteEducation.bind(null, e.id)} /></span>
              </div>
            </li>
          ))}
          {edus.length===0 && <li className="text-sm text-muted">Aucune formation.</li>}
        </ul>
        <ActionForm action={upsertEducation} successMessage="Formation enregistrée." className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input name="institution" required placeholder="Établissement *" aria-label="Établissement *" className={input} />
          <input name="institutionEn" placeholder="Établissement EN" aria-label="Établissement EN" className={input} />
          <input name="program" required placeholder="Programme *" aria-label="Programme *" className={input} />
          <input name="programEn" placeholder="Programme EN" aria-label="Programme EN" className={input} />
          <input name="startDate" required placeholder="Début" aria-label="Début" className={input} />
          <input name="endDate" placeholder="Fin" aria-label="Fin" className={input} />
          <select name="status" aria-label="Statut" className={input} defaultValue="PUBLISHED">
            <option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option>
          </select>
          <textarea name="description" placeholder="Description FR" aria-label="Description FR" rows={2} className={`${input} md:col-span-3`} />
          <textarea name="descriptionEn" placeholder="Description EN" aria-label="Description EN" rows={2} className={`${input} md:col-span-3`} />
          <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface md:col-span-3">Ajouter formation</SubmitButton>
        </ActionForm>
      </section>



      <section className={section}>
        <h2 className={h2}>Services</h2>
        <ul className="mb-2 flex flex-col gap-1 text-sm">
          {services.map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-bg">
              <div className="flex items-center justify-between gap-2 p-2.5">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer truncate">{s.title} [{s.status}] <span className="font-bold text-accent">· Éditer</span></summary>
                  <ActionForm action={upsertService} successMessage="Service enregistré." className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="title" required defaultValue={s.title} aria-label="Titre" className={input} />
                    <div className="flex gap-2">
                      <input name="titleEn" defaultValue={s.titleEn ?? ""} aria-label="Titre EN" className={`${input} flex-1`} />
                      <TranslateButton sourceName="title" targetName="titleEn" />
                    </div>
                    <input name="displayOrder" type="number" defaultValue={s.displayOrder} aria-label="Ordre" className={input} />
                    <select name="status" defaultValue={s.status} aria-label="Statut" className={input}>
                      <option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option>
                    </select>
                    <textarea name="description" defaultValue={s.description ?? ""} rows={2} aria-label="Description" className={`${input} md:col-span-3`} />
                    <div className="flex gap-2 md:col-span-3">
                      <textarea name="descriptionEn" defaultValue={s.descriptionEn ?? ""} rows={2} aria-label="Description EN" className={`${input} flex-1`} />
                      <TranslateButton sourceName="description" targetName="descriptionEn" />
                    </div>
                    <SubmitButton pendingLabel="…" className="w-fit rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink md:col-span-3">Enregistrer</SubmitButton>
                  </ActionForm>
                </details>
                <span className="flex shrink-0 items-center gap-1"><MoveButtons table="Service" id={s.id} /><DeleteButton label="Retirer" onDelete={deleteService.bind(null, s.id)} /></span>
              </div>
            </li>
          ))}
          {services.length===0 && <li className="text-sm text-muted">Aucun service.</li>}
        </ul>
        <ActionForm action={upsertService} successMessage="Service enregistré." className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input name="title" required placeholder="Titre * FR" aria-label="Titre * FR" className={input} />
          <div className="flex gap-2">
            <input name="titleEn" placeholder="Title EN (auto DeepL)" aria-label="Title EN (auto DeepL)" className={`${input} flex-1`} />
            <TranslateButton sourceName="title" targetName="titleEn" />
          </div>
          <input name="displayOrder" type="number" defaultValue={services.length} className={input} />
          <select name="status" aria-label="Statut" className={input} defaultValue="PUBLISHED"><option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="HIDDEN">HIDDEN</option></select>
          <textarea name="description" placeholder="Description FR" aria-label="Description FR" rows={2} className={`${input} md:col-span-3`} />
          <div className="flex gap-2 md:col-span-3">
            <textarea name="descriptionEn" placeholder="Description EN (auto)" aria-label="Description EN (auto)" rows={2} className={`${input} flex-1`} />
            <TranslateButton sourceName="description" targetName="descriptionEn" />
          </div>
          <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface md:col-span-3">Ajouter service</SubmitButton>
        </ActionForm>
      </section>


    </div>
  );
}

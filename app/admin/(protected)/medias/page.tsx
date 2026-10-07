import Link from "next/link";
import { adminList } from "@/lib/dal/admin";
import { uploadMedia, deleteMedia } from "@/lib/actions/media";
import { DeleteButton } from "@/components/admin-ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Upload } from "lucide-react";

export const dynamic = "force-dynamic";
const input = "rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none";

export default async function AdminMediasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const type = ["IMAGE", "VIDEO", "DOCUMENT"].includes((sp.type ?? "").toUpperCase())
    ? (sp.type as string).toUpperCase()
    : "ALL";
  const media = await adminList.media();
  const filtered = media.filter((m) => {
    if (type !== "ALL" && m.type !== type) return false;
    if (!q) return true;
    return [m.url, m.alt].some((v) => (v ?? "").toLowerCase().includes(q));
  });
  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), totalPages);
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const href = (p: number) => `/admin/medias?q=${encodeURIComponent(sp.q ?? "")}&type=${type}&page=${p}`;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Médias <span className="text-sm text-muted">({filtered.length}/{media.length})</span></h1>
      <ActionForm action={uploadMedia} successMessage="Média envoyé." className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary">Fichier (5 Mo max, pas de SVG)<input name="file" type="file" required accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.pdf" className={input} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary">Alt<input name="alt" placeholder="Description…" aria-label="Description…" className={input} /></label>
        <SubmitButton pendingLabel="Envoi…" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-black"><Upload className="h-4 w-4" /> Uploader</SubmitButton>
      </ActionForm>
      <form method="get" className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold text-secondary">Recherche
          <input name="q" defaultValue={sp.q ?? ""} placeholder="URL, description…" aria-label="Rechercher" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary">Type
          <select name="type" defaultValue={type} aria-label="Filtrer par type" className={input}>
            <option value="ALL">Tous</option>
            <option value="IMAGE">IMAGE</option>
            <option value="VIDEO">VIDEO</option>
            <option value="DOCUMENT">DOCUMENT</option>
          </select>
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-black">Filtrer</button>
        {(q || type !== "ALL") && <Link href="/admin/medias" className="rounded-full border border-border bg-bg px-4 py-2 text-sm font-bold text-ink hover:bg-surface">Réinitialiser</Link>}
      </form>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {slice.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              {m.type === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt || ""} loading="lazy" className="h-10 w-10 rounded-xl border border-border bg-bg object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-muted">{m.type === "VIDEO" ? "▶" : "PDF"}</div>
              )}
              <div className="min-w-0"><div className="truncate text-sm font-bold text-ink">{m.url}</div><div className="text-xs text-muted">{m.type} · {(m.size/1024).toFixed(0)} Ko</div></div>
            </div>
            <DeleteButton onDelete={deleteMedia.bind(null, m.id)} />
          </div>
        ))}
      </div>
      {filtered.length===0 && <div className="rounded-2xl border border-dashed border-border bg-bg p-8 text-center text-sm text-muted">Aucun média.</div>}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
          {page > 1 ? <Link href={href(page - 1)} className="rounded-full border border-border bg-surface px-4 py-2 font-bold text-ink hover:bg-bg">← Précédent</Link> : <span className="rounded-full border border-border px-4 py-2 text-muted">← Précédent</span>}
          <span className="font-mono text-xs text-muted tabular-nums">Page {page} / {totalPages}</span>
          {page < totalPages ? <Link href={href(page + 1)} className="rounded-full border border-border bg-surface px-4 py-2 font-bold text-ink hover:bg-bg">Suivant →</Link> : <span className="rounded-full border border-border px-4 py-2 text-muted">Suivant →</span>}
        </nav>
      )}
    </div>
  );
}

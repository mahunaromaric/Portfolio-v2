import Link from "next/link";
import { Mail } from "lucide-react";
import { adminList } from "@/lib/dal/admin";
import { setMessageStatus, deleteMessage } from "@/lib/actions/content";
import { DeleteButton, StatusSelect } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const input = "rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = ["NEW", "READ", "REPLIED", "ARCHIVED"].includes((sp.status ?? "").toUpperCase())
    ? (sp.status as string).toUpperCase()
    : "ALL";
  const messages = await adminList.messages();
  const unread = messages.filter((m) => m.status === "NEW").length;
  const filtered = messages.filter((m) => {
    if (status !== "ALL" && m.status !== status) return false;
    if (!q) return true;
    return [m.name, m.email, m.phone, m.subject, m.content].some((v) => (v ?? "").toLowerCase().includes(q));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), totalPages);
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const href = (p: number) => `/admin/messages?q=${encodeURIComponent(sp.q ?? "")}&status=${status}&page=${p}`;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">
        Messages <span className="text-sm text-muted">({filtered.length}/{messages.length})</span>{" "}
        {unread > 0 && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">{unread} non lus</span>}
      </h1>
      <form method="get" className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold text-secondary">Recherche
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Nom, email, contenu…" aria-label="Rechercher" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary">Statut
          <select name="status" defaultValue={status} aria-label="Filtrer par statut" className={input}>
            <option value="ALL">Tous</option>
            <option value="NEW">NEW</option>
            <option value="READ">READ</option>
            <option value="REPLIED">REPLIED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-black">Filtrer</button>
        {(q || status !== "ALL") && <Link href="/admin/messages" className="rounded-full border border-border bg-bg px-4 py-2 text-sm font-bold text-ink hover:bg-surface">Réinitialiser</Link>}
      </form>
      {filtered.length===0 ? <div className="rounded-2xl border border-dashed border-border bg-bg p-8 text-center text-sm text-muted flex flex-col items-center gap-2"><Mail className="h-5 w-5 text-muted" /> Aucun message.</div> : (
        <div className="grid gap-3">
          {slice.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1 break-all"><span className="font-bold text-ink">{m.name}</span> <span className="text-sm text-muted break-all">({m.email})</span>{m.phone && <span className="text-sm text-accent break-all"> — {m.phone}</span>}{m.subject && <span className="text-sm text-secondary break-words"> — {m.subject}</span>}</div>
                <div className="flex gap-2 shrink-0"><StatusSelect value={m.status} options={["NEW","READ","REPLIED","ARCHIVED"]} onChange={setMessageStatus.bind(null, m.id)} /><DeleteButton onDelete={deleteMessage.bind(null, m.id)} /></div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{m.content}</p>
              <p className="mt-2 text-xs text-muted">{new Date(m.createdAt).toLocaleString("fr-FR")}</p>
            </div>
          ))}
        </div>
      )}
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

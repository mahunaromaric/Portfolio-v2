import Link from "next/link";
import { Mail, FolderKanban, Briefcase, Layers, HardDrive, ArrowRight, Plus } from "lucide-react";
import { adminList } from "@/lib/dal/admin";
import { MessagesTrend, StatusDonut } from "@/components/admin/Charts";

export const dynamic = "force-dynamic";

function Kpi({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${accent ? "border-accent/20 bg-accent/[0.04]" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary">
        <Icon className={`h-3.5 w-3.5 ${accent ? "text-accent" : "text-muted"}`} />
        {label}
      </div>
      <div className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{value}</div>
      {sub && <div className={`mt-1 text-xs ${accent ? "text-accent font-bold" : "text-muted"}`}>{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const [messages, dash] = await Promise.all([adminList.messages(), adminList.dashboard()]);
  const published = dash.projectByStatus.PUBLISHED;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Dashboard</h1>
          <p className="text-sm text-secondary">Santé du contenu — Manrope · FAFAF9 · BE123C</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/projets" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-black"><Plus className="h-3.5 w-3.5" /> Nouveau projet</Link>
          <Link href="/admin/messages" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-bg">Messages <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:grid-cols-4">
        <Kpi icon={FolderKanban} label="Projets" value={`${published}/${dash.counts.projects}`} sub={`${dash.projectByStatus.DRAFT} brouillons`} />
        <Kpi icon={Mail} label="Messages" value={dash.counts.messages} sub={dash.messageByStatus.NEW ? `${dash.messageByStatus.NEW} non lus` : "0 non lu"} accent={dash.messageByStatus.NEW > 0} />
        
        <Kpi icon={HardDrive} label="Médias" value={dash.counts.media} sub={`${(dash.storage.totalSize / 1024).toFixed(0)} Ko · ${dash.storage.byType.IMAGE} images`} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi icon={Layers} label="Services" value={dash.counts.services} sub="éditables" />
        <Kpi icon={Briefcase} label="Expériences" value={dash.counts.experiences} />
        <Kpi icon={Layers} label="Santé" value={`${dash.health.pct}%`} sub={`${dash.health.withMedia}/${dash.health.total} avec média`} accent={dash.health.pct < 70} />
        <Kpi icon={Mail} label="7j" value={`${dash.delta7.last7}`} sub={`${dash.delta7.diff >= 0 ? "+" : ""}${dash.delta7.diff} vs sem. préc.`} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:col-span-3">
          <h2 className="text-sm font-bold text-ink">Messages — 14j</h2>
          <p className="text-xs text-muted">Volume quotidien</p>
          <div className="mt-4"><MessagesTrend data={dash.trend} /></div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:col-span-2">
          <h2 className="text-sm font-bold text-ink">Projets par statut</h2>
          <div className="mt-4"><StatusDonut published={dash.projectByStatus.PUBLISHED} draft={dash.projectByStatus.DRAFT} hidden={dash.projectByStatus.HIDDEN} /></div>
          <div className="mt-3 text-xs text-muted">Publiés {dash.projectByStatus.PUBLISHED} · Brouillons {dash.projectByStatus.DRAFT} · Masqués {dash.projectByStatus.HIDDEN}</div>
        </div>
      </div>

      {/* Health + Storage */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">Couverture</h3>
          <div className="mt-3 text-2xl font-extrabold text-ink">{dash.health.pct}%</div>
          <div className="mt-1 text-xs text-muted">{dash.health.featured} mis en avant · {dash.health.withMedia} avec média sur {dash.health.total}</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg"><div className="h-full bg-accent" style={{ width: `${dash.health.pct}%` }} /></div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">Stockage</h3>
          <div className="mt-3 text-sm font-bold text-ink">{dash.storage.total} fichiers</div>
          <div className="mt-1 text-xs text-muted">Images {dash.storage.byType.IMAGE} · Vidéos {dash.storage.byType.VIDEO} · Docs {dash.storage.byType.DOCUMENT}</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">Messages par statut</h3>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {Object.entries(dash.messageByStatus).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-bg p-2"><div className="font-extrabold text-ink">{v}</div><div className="text-[10px] uppercase tracking-wide text-muted">{k}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink">Derniers messages</h2>
          <Link href="/admin/messages" className="text-xs font-bold text-accent hover:underline">Voir tout →</Link>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {messages.slice(0, 5).map((m) => (
            <li key={m.id} className="rounded-xl border border-border bg-bg p-3 text-sm">
              <span className="font-bold text-ink">{m.name}</span> <span className="text-muted">({m.email})</span> <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${m.status === "NEW" ? "bg-accent text-white" : "bg-surface border border-border text-secondary"}`}>{m.status}</span>
              <span className="ml-2 text-xs text-muted">{new Date(m.createdAt).toLocaleString("fr-FR")}</span>
              <p className="mt-1 line-clamp-2 text-secondary">{m.content.slice(0, 140)}</p>
            </li>
          ))}
          {messages.length === 0 && <p className="text-sm text-muted">Aucun message.</p>}
        </ul>
      </section>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/projets" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-black">+ Projet</Link>
        <Link href="/admin/medias" className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-bg">Uploader média</Link>
        <Link href="/admin/contenu" className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-bg">Éditer profil</Link>
      </div>
    </div>
  );
}

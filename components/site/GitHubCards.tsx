import { getGitHubActivity, getGitHubLanguages, GITHUB_USERNAME } from "@/lib/github";

function CardShell({ title, meta, children }: { title: string; meta: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="text-sm font-bold text-ink">{title}</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted">{meta}</span>
      </div>
      {children}
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <CardShell title="…" meta="…">
      <div className="mt-4 grid grid-cols-12 gap-1" aria-hidden>
        {Array.from({ length: 84 }).map((_, i) => (
          <div key={i} className="h-3 w-full animate-pulse rounded-sm bg-surfaceSunken" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="mx-auto h-6 w-10 animate-pulse rounded bg-surfaceSunken" />
        ))}
      </div>
    </CardShell>
  );
}

export async function ActivityCard({
  isEn,
  labels,
}: {
  isEn: boolean;
  labels: { title: string; commits: string; prs: string; activeDays: string };
}) {
  const activity = await getGitHubActivity();
  return (
    <CardShell
      title={labels.title}
      meta={
        <>
          {activity && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />}
          {activity ? `${activity.username} · ${isEn ? "live · 30d" : "live · 30j"}` : `${GITHUB_USERNAME} · 30${isEn ? "d" : "j"}`}
        </>
      }
    >
      <div className="mt-4 grid grid-cols-12 gap-1">
        {(activity?.cells ?? Array.from({ length: 84 }, () => 0)).map((level, i) => {
          const bg = level === 0 ? "bg-surfaceSunken" : level === 1 ? "bg-accent/20" : level === 2 ? "bg-accent/40" : level === 3 ? "bg-accent/70" : "bg-accent";
          return <div key={i} className={`h-3 w-full rounded-sm ${bg}`} />;
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
        <div><div className="text-lg font-extrabold text-ink tabular-nums">{activity?.commits ?? "—"}</div><div className="text-[10px] uppercase tracking-wide text-muted">{labels.commits}</div></div>
        <div><div className="text-lg font-extrabold text-ink tabular-nums">{activity?.prs ?? "—"}</div><div className="text-[10px] uppercase tracking-wide text-muted">{labels.prs}</div></div>
        <div><div className="text-lg font-extrabold text-ink tabular-nums">{activity?.activeDays ?? "—"}</div><div className="text-[10px] uppercase tracking-wide text-muted">{labels.activeDays}</div></div>
      </div>
    </CardShell>
  );
}

export function LanguagesSkeleton() {
  return (
    <CardShell title="…" meta="…">
      <div className="mt-4 flex flex-col gap-3" aria-hidden>
        {[72, 45, 28].map((w) => (
          <div key={w} className="h-8 animate-pulse rounded-xl bg-surfaceSunken" style={{ width: `${w}%` }} />
        ))}
      </div>
    </CardShell>
  );
}

export async function LanguagesCard({ isEn, title }: { isEn: boolean; title: string }) {
  const languages = await getGitHubLanguages();
  return (
    <CardShell
      title={title}
      meta={
        <>
          {languages && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />}
          {isEn ? "public repos" : "dépôts publics"}
        </>
      }
    >
      <div className="mt-4 flex flex-col gap-3">
        {languages ? languages.map((l) => (
          <div key={l.language}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-bold text-ink">{l.language}</span>
              <span className="font-mono text-xs tabular-nums text-muted">{l.pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surfaceSunken">
              <div className="h-full rounded-full bg-accent" style={{ width: `${l.pct}%` }} />
            </div>
          </div>
        )) : (
          <div className="flex flex-wrap gap-1.5">
            {["React", "Next.js", "Laravel", "Node.js", "MySQL"].map((name) => (
              <span key={name} className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-bold text-secondary">{name}</span>
            ))}
          </div>
        )}
      </div>
    </CardShell>
  );
}

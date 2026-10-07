export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Chargement">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-border" />
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-border" />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-bg" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-bg [&:not(:first-child)]:mt-2" />
        ))}
      </div>
    </div>
  );
}

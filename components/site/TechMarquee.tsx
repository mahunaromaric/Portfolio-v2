const FALLBACK: Record<string, string> = {
  javascript: "https://cdn.simpleicons.org/javascript/1c1917",
  react: "https://cdn.simpleicons.org/react/1c1917",
  "next.js": "https://cdn.simpleicons.org/nextdotjs/1c1917",
  nextjs: "https://cdn.simpleicons.org/nextdotjs/1c1917",
  html: "https://cdn.simpleicons.org/html5/1c1917",
  html5: "https://cdn.simpleicons.org/html5/1c1917",
  css: "https://cdn.simpleicons.org/css/1c1917",
  php: "https://cdn.simpleicons.org/php/1c1917",
  laravel: "https://cdn.simpleicons.org/laravel/1c1917",
  "node.js": "https://cdn.simpleicons.org/nodedotjs/1c1917",
  nodejs: "https://cdn.simpleicons.org/nodedotjs/1c1917",
  git: "https://cdn.simpleicons.org/git/1c1917",
  github: "https://cdn.simpleicons.org/github/1c1917",
  postgresql: "https://cdn.simpleicons.org/postgresql/1c1917",
  mysql: "https://cdn.simpleicons.org/mysql/1c1917",
  mariadb: "https://cdn.simpleicons.org/mariadb/1c1917",
  prisma: "https://cdn.simpleicons.org/prisma/1c1917",
  sql: "https://cdn.simpleicons.org/mysql/1c1917",
  typescript: "https://cdn.simpleicons.org/typescript/1c1917",
  "framer-motion": "https://cdn.simpleicons.org/framer/1c1917",
  framer: "https://cdn.simpleicons.org/framer/1c1917",
  n8n: "https://cdn.simpleicons.org/n8n/1c1917",
  ia: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg",
  openai: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg",
  tailwindcss: "https://cdn.simpleicons.org/tailwindcss/1c1917",
  docker: "https://cdn.simpleicons.org/docker/1c1917",
  figma: "https://cdn.simpleicons.org/figma/1c1917",
  vercel: "https://cdn.simpleicons.org/vercel/1c1917",
  linux: "https://cdn.simpleicons.org/linux/1c1917",
};

const ORDER = ["javascript", "react", "next.js", "php", "laravel", "postgresql", "mysql", "prisma", "node.js", "github"];

function norm(s: string) {
  return s.toLowerCase().trim();
}

export function TechMarquee({ technologies, compact = false }: { technologies: { name: string; slug: string; icon?: string | null }[]; compact?: boolean }) {
  // Map DB techs by slug/name, keep requested order + monochrome
  const bySlug = new Map(technologies.map((t) => [norm(t.slug), t]));
  const byName = new Map(technologies.map((t) => [norm(t.name), t]));
  const items = ORDER.map((key) => {
    const t = bySlug.get(norm(key)) ?? byName.get(norm(key)) ?? { name: key === "next.js" ? "Next.js" : key.charAt(0).toUpperCase() + key.slice(1), slug: key, icon: null } as never;
    const url = (t as { icon?: string | null }).icon?.trim() || FALLBACK[norm(key)] || FALLBACK[norm(t.slug)] || null;
    const displayName = (t as { name: string }).name;
    return { key, name: displayName, icon: url };
  });

  // Technos DB hors liste ORDER : ajoutées à la suite (ordre alpha) pour ne jamais les masquer.
  const orderKeys = new Set(ORDER.map(norm));
  const extra = technologies
    .filter((t) => !orderKeys.has(norm(t.slug)) && !orderKeys.has(norm(t.name)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({ key: `extra-${t.slug}`, name: t.name, icon: t.icon?.trim() || FALLBACK[norm(t.slug)] || null }));
  const full = [...items, ...extra];
  const fullLoop = [...full, ...full];

  if (compact) {
    return (
      <div className="w-full max-w-[320px] overflow-hidden bg-transparent pointer-events-none select-none" style={{ maskImage: "linear-gradient(to right, black 75%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 75%, transparent 100%)" }}>
        <div className="flex w-max animate-[marquee_28s_linear_infinite] motion-reduce:animate-none">
          {fullLoop.map((it, i) => (
            <div key={`${it.key}-${i}`} className="flex items-center justify-center px-3.5 py-2 shrink-0">
              {it.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.icon} alt={it.name} width={18} height={18} className="h-[18px] w-[18px] object-contain opacity-90 dark:invert dark:brightness-125" loading="lazy" crossOrigin="anonymous" />
              ) : (
                <span className="h-[18px] w-[18px] rounded bg-ink/10" />
              )}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="relative w-screen max-w-none left-1/2 right-1/2 -mx-[50vw] border-y border-border bg-surface overflow-hidden">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:overflow-x-auto">
        {fullLoop.map((it, i) => (
          <div key={`${it.key}-${i}`} className="flex items-center gap-2 px-6 py-3 shrink-0 border-r border-border/60 last:border-r-0">
            {/* eslint-disable @next/next/no-img-element */}
            {it.icon ? (
              <img src={it.icon} alt="" width={16} height={16} className="h-4 w-4 object-contain opacity-90 dark:invert dark:brightness-125" loading="lazy" crossOrigin="anonymous" />
            ) : (
              <span className="h-4 w-4 rounded bg-ink/10" />
            )}
            <span className="text-xs font-bold tracking-wide text-ink whitespace-nowrap">{it.name}</span>
            <span className="h-1 w-1 rounded-full bg-accent/40" />
          </div>
        ))}
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

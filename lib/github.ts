// Activité GitHub publique : contributions 30 derniers jours + grille 84 jours.
// Cache 1h (quota search API : 10 req/min sans token, 30/min avec).
// Retourne null si l'API est injoignable — l'UI affiche alors un état neutre.

export const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "mahunaromaric";

export type GitHubActivity = {
  username: string;
  commits: number;
  prs: number;
  activeDays: number;
  cells: number[]; // 84 niveaux 0-4, plus récent en dernier
  live: boolean;
};

export type GitHubLanguage = { language: string; bytes: number; pct: number };

// Top langages des dépôts publics (octets cumulés, cache 1h). Null si injoignable.
export async function getGitHubLanguages(): Promise<GitHubLanguage[] | null> {
  const username = GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-v2",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const cache = { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) } as const;
  try {
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers,
      ...cache,
    });
    if (!reposRes.ok) return null;
    const repos = (await reposRes.json()) as unknown;
    if (!Array.isArray(repos)) return null;
    const totals = new Map<string, number>();
    await Promise.all(
      (repos as { private: boolean; languages_url: string }[])
        .filter((r) => !r.private && typeof r.languages_url === "string")
        .map(async (repo) => {
          const res = await fetch(repo.languages_url, { headers, ...cache });
          if (!res.ok) return;
          const langs = (await res.json()) as unknown;
          if (langs === null || typeof langs !== "object") return;
          for (const [lang, bytes] of Object.entries(langs as Record<string, unknown>)) {
            if (typeof bytes === "number") totals.set(lang, (totals.get(lang) ?? 0) + bytes);
          }
        }),
    );
    const sum = [...totals.values()].reduce((s, n) => s + n, 0);
    if (sum === 0) return null;
    return [...totals.entries()]
      .map(([language, bytes]) => ({ language, bytes, pct: Math.round((bytes / sum) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  } catch {
    return null;
  }
}

const WINDOW_DAYS = 30;
const CELLS = 84;

function isoDay(daysAgo: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

type RepoRef = { private: boolean; full_name: string };
type CommitRef = { commit?: { author?: { date?: string } } };

export async function getGitHubActivity(): Promise<GitHubActivity | null> {
  const username = GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-v2",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const searchHeaders = { ...headers, Accept: "application/vnd.github.cloak-preview" };
  const cache = { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) } as const;

  try {
    const since30 = isoDay(WINDOW_DAYS);
    const [commitsRes, prsRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/search/commits?q=author:${username}+author-date:>${since30}`, {
        headers: searchHeaders,
        ...cache,
      }),
      fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr+created:>${since30}`, {
        headers,
        ...cache,
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers, ...cache }),
    ]);
    if (!commitsRes.ok || !prsRes.ok || !reposRes.ok) return null;

    const commitsTotal = (await commitsRes.json()).total_count as number;
    const prsTotal = (await prsRes.json()).total_count as number;
    const repos = (await reposRes.json()) as unknown;
    if (!Array.isArray(repos)) return null;

    const since84 = new Date();
    since84.setUTCDate(since84.getUTCDate() - CELLS);
    const perDay = new Map<string, number>();
    await Promise.all(
      (repos as RepoRef[])
        .filter((r) => !r.private && typeof r.full_name === "string")
        .map(async (repo) => {
          const res = await fetch(
            `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${since84.toISOString()}&per_page=100`,
            { headers, ...cache },
          );
          if (!res.ok) return;
          const list = (await res.json()) as unknown;
          if (!Array.isArray(list)) return;
          for (const c of list as CommitRef[]) {
            const date = c?.commit?.author?.date?.slice(0, 10);
            if (date) perDay.set(date, (perDay.get(date) ?? 0) + 1);
          }
        }),
    );

    let activeDays = 0;
    for (const day of perDay.keys()) if (day > since30) activeDays++;

    const counts: number[] = [];
    for (let i = CELLS - 1; i >= 0; i--) counts.push(perDay.get(isoDay(i)) ?? 0);
    const max = Math.max(1, ...counts);
    const cells = counts.map((n) => (n === 0 ? 0 : Math.min(4, Math.max(1, Math.round((n / max) * 4)))));

    return { username, commits: commitsTotal ?? 0, prs: prsTotal ?? 0, activeDays, cells, live: true };
  } catch {
    return null;
  }
}

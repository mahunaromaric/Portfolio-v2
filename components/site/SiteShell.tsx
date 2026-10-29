import { Link } from "@/i18n/navigation";
import { ArrowRight, ArrowUp, ArrowUpRight, Globe, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { getProfile } from "@/lib/dal/public";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { AnchorLink } from "./AnchorLink";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollHeader } from "./ScrollHeader";

const W = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8";

/** Normalise les URL sociales legacy sans schéma (sinon lien relatif cassé). */
export const extUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  // Certaines données legacy stockent seulement "in/<slug>" pour LinkedIn.
  if (/^\/?in\//i.test(url)) return `https://www.linkedin.com/${url.replace(/^\//, "")}`;
  return `https://${url}`;
};

export async function SiteHeader() {
  const t = await getTranslations("header");
  return (
    <ScrollHeader>
      <div className={`${W} flex h-[72px] items-center justify-between`}>
        <AnchorLink href="/#hero" ariaLabel="Romaric GBENOU — accueil" className="inline-flex min-h-[48px] items-center">
          <Logo />
        </AnchorLink>
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden lg:flex items-center gap-2 text-[13px] xl:gap-4 font-bold tracking-[0.04em] text-secondary">
            <AnchorLink href="/#hero" className="inline-flex min-h-[48px] items-center whitespace-nowrap px-1 hover:text-ink transition-colors">{t("home")}</AnchorLink>
            <AnchorLink href="/#about" className="inline-flex min-h-[48px] items-center whitespace-nowrap px-1 hover:text-ink transition-colors">{t("about")}</AnchorLink>
            <AnchorLink href="/#projects" className="inline-flex min-h-[48px] items-center whitespace-nowrap px-1 hover:text-ink transition-colors">{t("projects")}</AnchorLink>
            <AnchorLink href="/#experience" className="inline-flex min-h-[48px] items-center whitespace-nowrap px-1 hover:text-ink transition-colors">{t("experience")}</AnchorLink>
            <AnchorLink href="/#services" className="inline-flex min-h-[48px] items-center whitespace-nowrap px-1 hover:text-ink transition-colors">{t("services")}</AnchorLink>
            <AnchorLink href="/#collaboration" className="inline-flex min-h-[48px] items-center whitespace-nowrap px-1 hover:text-ink transition-colors">{t("collaboration")}</AnchorLink>
          </nav>
          <ThemeToggle />
          <LocaleSwitcher />
          <AnchorLink href="/#contact" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink px-4 py-2 text-[12px] font-bold text-ink transition-[background-color,color] hover:bg-ink hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{t("contact")}</AnchorLink>
        </div>
      </div>
    </ScrollHeader>
  );
}

const SOCIAL_PATHS: Record<string, string> = {
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  instagram:
    "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
};

function socialPath(platform: string) {
  const p = platform.toLowerCase().replace(/[^a-z]/g, "");
  if (p.includes("github")) return SOCIAL_PATHS.github;
  if (p.includes("linkedin")) return SOCIAL_PATHS.linkedin;
  if (p.includes("whatsapp")) return SOCIAL_PATHS.whatsapp;
  if (p.includes("instagram")) return SOCIAL_PATHS.instagram;
  if (p === "x" || p.includes("twitter")) return SOCIAL_PATHS.x;
  return null;
}

function SocialGlyph({ platform }: { platform: string }) {
  const d = socialPath(platform);
  if (!d) return <Globe className="h-[18px] w-[18px]" aria-hidden />;
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden focusable="false">
      <path d={d} />
    </svg>
  );
}

export async function SiteFooter() {
  const tFooter = await getTranslations("footer");
  const tHeader = await getTranslations("header");
  const profile = await getProfile().catch(() => null);
  const socialLinks = profile?.socialLinks ?? [];
  const socials = socialLinks.length > 0
    ? socialLinks.map((l) => ({ id: l.id, platform: l.platform ?? "Lien", url: l.url }))
    : [
        { id: "gh", platform: "GitHub", url: "https://github.com/mahunaromaric" },
        { id: "wa", platform: "WhatsApp", url: "https://wa.me/2290161642237" },
      ];
  const whatsapp = socials.find((l) => l.platform.toLowerCase().includes("whatsapp"))?.url ?? "https://wa.me/2290161642237";
  const email = profile?.contactEmail ?? "romamahuna@gmail.com";

  const now = new Date();
  const cotonouTime = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Porto-Novo" }).format(now);

  return (
    <footer className="relative overflow-hidden bg-surfaceSunken pb-24 pt-14 text-secondary sm:pt-20 lg:pb-0 dark:bg-brandDark dark:text-stone-300">
      <div className={W}>
        <div className="relative z-10 rounded-3xl border border-border bg-surface p-6 shadow-[0_16px_40px_rgba(28,25,23,0.08)] sm:p-9 lg:p-12 dark:border-white/10 dark:shadow-none">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-4">
              <Logo />
              <p className="mt-4 max-w-[300px] text-[13px] leading-relaxed">{tFooter("build")}</p>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-secondary">
                <span className="tabular-nums text-ink">{cotonouTime}</span> GMT+1 · Cotonou, BJ
              </p>
              <span className="mt-4 flex items-start gap-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-secondary">
                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {profile?.availabilityLabel || tFooter("thanks")}
              </span>
              <ul className="mt-6 flex flex-wrap items-center gap-2">
                {socials.map((l) => (
                  <li key={l.id}>
                    <a
                      href={extUrl(l.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={l.platform}
                      title={l.platform}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-secondary transition-[color,border-color,background-color] duration-300 hover:border-accent hover:bg-accentMuted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:hover:border-accent"
                    >
                      <SocialGlyph platform={l.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav className="lg:col-span-3" aria-label={tFooter("nav")}>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">{tFooter("nav")}</p>
              <ul className="mt-5 text-[13px] font-bold">
                {[
                  { href: "/#about" as const, label: tHeader("about"), n: "01" },
                  { href: "/#projects" as const, label: tHeader("projects"), n: "02" },
                  { href: "/#experience" as const, label: tHeader("experience"), n: "03" },
                  { href: "/#services" as const, label: tHeader("services"), n: "04" },
                  { href: "/#collaboration" as const, label: tHeader("collaboration"), n: "05" },
                  { href: "/#faq" as const, label: tHeader("faq"), n: "06" },
                  { href: "/#contact" as const, label: tHeader("contact"), n: "07" },
                ].map((l) => (
                  <li key={l.href}>
                    <AnchorLink href={l.href} className="group inline-flex min-h-[48px] items-center gap-3 transition-colors duration-300 hover:text-accent">
                      <span className="font-mono text-[11px] font-medium text-secondary transition-colors duration-300 group-hover:text-clay">{l.n}</span>
                      {l.label}
                    </AnchorLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-secondary">{tFooter("contact")}</p>
              <ul className="mt-5 text-[13px] font-bold">
                <li>
                  <a href={`mailto:${email}`} className="group inline-flex min-h-[48px] max-w-full items-center gap-2.5 break-all transition-colors duration-300 hover:text-accent">
                    <Mail className="h-4 w-4 shrink-0 text-muted transition-colors duration-300 group-hover:text-accent" aria-hidden />
                    {email}
                  </a>
                </li>
                <li>
                  <a href={extUrl(whatsapp)} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-[48px] items-center gap-2.5 transition-colors duration-300 hover:text-accent">
                    <SocialGlyph platform="whatsapp" />
                    WhatsApp
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                  </a>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <AnchorLink href="/#contact" className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-brandDark px-6 py-3 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(28,25,23,0.18)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_12px_32px_rgba(28,25,23,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-[190px] dark:bg-white dark:text-stone-950 dark:hover:bg-accent">
                  {tFooter("start")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                </AnchorLink>
                <Link href="/work" className="group inline-flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-full border border-border px-6 py-3 text-[13px] font-bold text-ink transition-[color,border-color,background-color] duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-[190px] dark:border-white/20 dark:text-white dark:hover:border-accent dark:hover:text-accent">
                  {tFooter("allProjects")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6 dark:border-white/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] tracking-wide text-secondary">{tFooter("rights", { year: now.getFullYear() })}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/mentions-legales" className="inline-flex min-h-[48px] items-center text-[11px] tracking-wide text-secondary transition-colors duration-300 hover:text-accent">
                  {tFooter("legal")}
                </Link>
                <AnchorLink href="#hero" ariaLabel={tFooter("backToTop")} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-secondary transition-[color,border-color] duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10">
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </AnchorLink>
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none relative z-0 -mt-[clamp(28px,5.8vw,84px)] select-none overflow-hidden">
          <p className="translate-y-[32%] text-center font-serif text-[26vw] font-normal leading-[0.75] tracking-[-0.05em] text-ink opacity-[0.05] sm:text-[21vw]">MAHUNA</p>
        </div>
      </div>
    </footer>
  );
}

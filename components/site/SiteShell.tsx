import { Link } from "@/i18n/navigation";
import { ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { getProfile } from "@/lib/dal/public";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { AnchorLink } from "./AnchorLink";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollHeader } from "./ScrollHeader";

const W = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8";

export async function SiteHeader() {
  const t = await getTranslations("header");
  return (
    <ScrollHeader>
      <div className={`${W} flex h-[72px] items-center justify-between`}>
        <Link href="/" aria-label="Romaric GBENOU — accueil">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-bold tracking-[0.04em] text-secondary">
            <AnchorLink href="/#hero" className="hover:text-ink transition-colors">{t("home")}</AnchorLink>
            <AnchorLink href="/#about" className="hover:text-ink transition-colors">{t("about")}</AnchorLink>
            <AnchorLink href="/#projects" className="hover:text-ink transition-colors">{t("projects")}</AnchorLink>
            <AnchorLink href="/#experience" className="hover:text-ink transition-colors">{t("experience")}</AnchorLink>
            <AnchorLink href="/#services" className="hover:text-ink transition-colors">{t("services")}</AnchorLink>
            <AnchorLink href="/#collaboration" className="hover:text-ink transition-colors">{t("collaboration")}</AnchorLink>
          </nav>
          <ThemeToggle />
          <LocaleSwitcher />
          <AnchorLink href="/#contact" className="rounded-full border border-ink px-4 py-1.5 text-[13px] font-bold text-ink transition-[background-color,color] hover:bg-ink hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{t("contact")}</AnchorLink>
        </div>
      </div>
    </ScrollHeader>
  );
}

export async function SiteFooter() {
  const tFooter = await getTranslations("footer");
  const tHeader = await getTranslations("header");
  const profile = await getProfile();
  const socialLinks = profile?.socialLinks ?? [];

  const now = new Date();
  const cotonouTime = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Porto-Novo" }).format(now);

  return (
    <footer className="border-t border-border bg-surfaceSunken text-secondary dark:border-white/10 dark:bg-brandDark dark:text-stone-300 pb-[env(safe-area-inset-bottom)]">
      <div className={`${W} py-12 sm:py-16`}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed">{tFooter("build")}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              Cotonou, BJ — <span className="tabular-nums text-ink dark:text-stone-300">{cotonouTime}</span> GMT+1
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-secondary dark:border-white/10 dark:bg-white/5 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />{tFooter("thanks")}
            </div>
          </div>

          <nav className="md:col-span-3" aria-label="Index">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Index</p>
            <ul className="mt-4 space-y-2.5 text-[13px] font-bold">
              {[
                { href: "/#about" as const, label: tHeader("about"), n: "01" },
                { href: "/#projects" as const, label: tHeader("projects"), n: "02" },
                { href: "/#experience" as const, label: tHeader("experience"), n: "03" },
                { href: "/#collaboration" as const, label: tHeader("collaboration"), n: "04" },
                { href: "/#contact" as const, label: tHeader("contact"), n: "05" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group inline-flex items-baseline gap-3 transition-colors duration-300 hover:text-ink dark:text-stone-400 dark:hover:text-white">
                    <span className="font-mono text-[11px] font-medium text-muted group-hover:text-clay">{l.n}</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Socials</p>
            <ul className="mt-4 space-y-2.5 text-[13px] font-bold">
              {(socialLinks.length > 0
                ? socialLinks.map((l) => ({ id: l.id, platform: l.platform ?? "Lien", url: l.url }))
                : [
                    { id: "gh", platform: "GitHub", url: "https://github.com" },
                    { id: "li", platform: "LinkedIn", url: "https://linkedin.com" },
                    { id: "wa", platform: "WhatsApp", url: "https://wa.me/2290161642237" },
                  ]
              ).map((l) => (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-ink dark:text-stone-400 dark:hover:text-white">
                    {l.platform} <ArrowUpRight className="h-3.5 w-3.5 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Projet</p>
            <Link href="/#contact" className="group mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-bold text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:bg-white dark:text-stone-950 dark:hover:bg-orange-100">
              Démarrer <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link href="/work" className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-ink/80 transition-colors hover:text-ink dark:text-white/80 dark:hover:text-white">
              {tFooter("allProjects")} <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-12 select-none" aria-hidden>
          <p className="font-serif text-[clamp(48px,10vw,128px)] font-normal leading-[0.95] tracking-[-0.03em] text-ink/90 dark:text-white/90">
            Romaric <span className="italic text-ink/60 dark:text-white/70">GBENOU</span> <span className="font-sig text-[0.6em] font-normal text-clay">mahuna</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] tracking-wide text-muted">{tFooter("rights", { year: new Date().getFullYear() })}</p>
          <AnchorLink href="#hero" className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-secondary transition-colors duration-300 hover:border-clay hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay dark:border-white/10 dark:text-stone-400 dark:hover:border-clay dark:hover:text-white">
            Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </AnchorLink>
        </div>
      </div>
    </footer>
  );
}

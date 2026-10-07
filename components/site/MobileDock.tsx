"use client";

import { useState } from "react";
import { AnchorLink } from "./AnchorLink";
import { useTranslations } from "next-intl";
import { SillonMark } from "./Logo";
import { Home, FolderKanban, Briefcase, Mail, MoreHorizontal, X, User, Layers, Handshake } from "lucide-react";

export function MobileDock() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("header");
  const PRIMARY = [
    { href: "/#hero", label: t("home"), icon: Home },
    { href: "/#projects", label: t("projects"), icon: FolderKanban },
    { href: "/#experience", label: t("experience"), icon: Briefcase },
    { href: "/#contact", label: t("contact"), icon: Mail },
  ];
  const SECONDARY = [
    { href: "/#about", label: t("about"), icon: User },
    { href: "/#services", label: t("services"), icon: Layers },
    { href: "/#collaboration", label: t("collaboration"), icon: Handshake },
  ];
  return (
    <>
      <div className="lg:hidden fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full bg-[#0C0A09] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.22)] border border-white/10">
        {PRIMARY.map((item) => {
          const Icon = item.icon;
          return (
            <AnchorLink key={item.href} href={item.href} ariaLabel={item.label} className="flex h-11 w-11 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition">
              <Icon className="h-4 w-4" />
            </AnchorLink>
          );
        })}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fermer" : "Plus"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition"
        >
          {open ? <X className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
      )}
      <div
        className={`lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[min(320px,calc(100%-32px))] rounded-3xl border border-border bg-surface p-4 shadow-xl transition-all duration-300 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-center mb-3">
          <SillonMark className="h-10 w-10" />
        </div>
        <nav className="grid gap-1">
          {SECONDARY.map((item) => {
            const Icon = item.icon;
            return (
              <AnchorLink
                key={item.href}
                href={item.href}
                onNavigate={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-secondary hover:bg-bg hover:text-ink transition"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </AnchorLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}

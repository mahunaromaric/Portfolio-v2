"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-surface p-[3px] text-[11px] font-bold">
      <button
        onClick={() => switchLocale("fr")}
        disabled={isPending}
        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 ${locale === "fr" ? "bg-ink text-bg" : "text-secondary hover:text-ink"}`}
        aria-label="Français"
      >
        FR
      </button>
      <button
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 ${locale === "en" ? "bg-ink text-bg" : "text-secondary hover:text-ink"}`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}

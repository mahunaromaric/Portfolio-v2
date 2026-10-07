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
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs font-bold">
      <button
        onClick={() => switchLocale("fr")}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-full transition ${locale === "fr" ? "bg-brandDark text-white" : "text-secondary hover:text-ink"}`}
        aria-label="Français"
      >
        FR
      </button>
      <button
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-full transition ${locale === "en" ? "bg-brandDark text-white" : "text-secondary hover:text-ink"}`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}

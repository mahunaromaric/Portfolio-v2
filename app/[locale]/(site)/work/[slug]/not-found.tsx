import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

const W = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className={`${W} py-28`}>
      <p className="text-[12px] font-bold uppercase tracking-[0.11em] text-secondary">404</p>
      <h1 className="mt-4 text-[clamp(32px,5vw,48px)] tracking-[-0.05em] font-extrabold">{t("title")}</h1>
      <p className="mt-4 text-secondary">{t("description")}</p>
      <Link href="/work" className="mt-8 inline-flex items-center gap-1.5 border border-border px-5 py-3 text-[14px] font-bold text-secondary hover:text-ink">
        {t("back")} <ArrowRight className="ml-2 h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { TopLoader } from "@/components/site/TopLoader";
import { PERSON_KEYWORDS, PERSON_NAME, SITE_URL } from "@/lib/seo";

const siteUrl = SITE_URL;
const siteName = "Romaric GBENOU — Product Builder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const description = isEn
    ? "Romaric GBENOU (Mahuna) — Product Builder & Developer. I design useful digital products, from idea to interface, with solid technical foundations and attention to detail."
    : "Romaric GBENOU (Mahuna) — Product Builder & Développeur. Je conçois des produits numériques utiles, de l’idée à l’interface, avec une base technique solide et le souci du détail.";
  return {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: isEn ? "/en" : "/", languages: { fr: "/", en: "/en" } },
    title: { default: siteName, template: `%s — ${siteName}` },
    description,
    keywords: PERSON_KEYWORDS,
    authors: [{ name: PERSON_NAME, url: siteUrl }],
    creator: PERSON_NAME,
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "fr_FR",
      alternateLocale: isEn ? ["fr_FR"] : ["en_US"],
      url: siteUrl,
      siteName,
      title: siteName,
      description,
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [`${siteUrl}/opengraph-image`],
    },
    robots: { index: true, follow: true },
    verification: { google: "GJF8ddlWHFJinWyCaOtrDY8UQ9SXI-okrCCKv17IPd8" },
  };
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0A09" },
  ],
  colorScheme: "light dark" as const,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <div className="min-h-full flex flex-col bg-bg text-ink antialiased">
      <ThemeProvider attribute="class" defaultTheme="system">
        <NextIntlClientProvider messages={messages}>
          <TopLoader />
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:min-h-[48px] focus:inline-flex focus:items-center bg-ink text-white px-4 py-2 rounded-full text-xs z-50">
            Aller au contenu
          </a>
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}

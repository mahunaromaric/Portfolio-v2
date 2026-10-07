import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // S3 prod (R2, Scaleway, AWS) — ajoute le pattern de ton bucket ici si besoin
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.scw.cloud" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      // S3_PUBLIC_URL custom
      ...(process.env.S3_PUBLIC_URL
        ? (() => {
            try {
              const u = new URL(process.env.S3_PUBLIC_URL);
              return [{ protocol: u.protocol.replace(":", "") as "https", hostname: u.hostname } as const];
            } catch {
              return [];
            }
          })()
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);

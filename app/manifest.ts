import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Romaric GBENOU (Mahuna) — Product Builder",
    short_name: "RG Portfolio",
    description: "Romaric GBENOU (Mahuna) — Product Builder · Développeur — Cotonou, Bénin",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF9",
    theme_color: "#1E3A8A",
    icons: [
      { src: "/brand/sillon-apple-180.png", sizes: "180x180", purpose: "any", type: "image/png" },
      { src: "/brand/sillon-icon-48.png", sizes: "48x48", purpose: "maskable", type: "image/png" },
      { src: "/brand/sillon-icon-192.png", sizes: "192x192", purpose: "maskable", type: "image/png" },
      { src: "/brand/sillon-icon-96.png", sizes: "96x96", purpose: "maskable", type: "image/png" },
    ],
  };
}

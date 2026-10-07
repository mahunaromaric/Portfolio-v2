import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Romaric GBENOU — Product Builder",
    short_name: "RG Portfolio",
    description: "Product Builder · Développeur — Cotonou, Bénin",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF9",
    theme_color: "#1E3A8A",
    icons: [
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
  };
}

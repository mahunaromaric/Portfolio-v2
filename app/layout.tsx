import "./globals.css";
import localFont from "next/font/local";

const manrope = localFont({
  variable: "--font-manrope",
  src: [
    { path: "../public/fonts/manrope-300.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/manrope-400.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/manrope-500.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/manrope-600.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/manrope-700.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/manrope-800.ttf", weight: "800", style: "normal" },
  ],
  display: "swap",
  preload: false,
});

const instrumentSerif = localFont({
  variable: "--font-instrument-serif",
  src: [
    { path: "../public/fonts/instrument-serif-regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/instrument-serif-italic.ttf", weight: "400", style: "italic" },
  ],
  display: "swap",
  preload: false,
});

const sacramento = localFont({
  variable: "--font-sacramento",
  src: [{ path: "../public/fonts/sacramento-regular.ttf", weight: "400", style: "normal" }],
  display: "swap",
  preload: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${manrope.variable} ${instrumentSerif.variable} ${sacramento.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

import { ImageResponse } from "next/og";

export const alt = "Romaric GBENOU — Product Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 60,
          background: "#FAFAF9",
          fontFamily: "sans-serif",
        }}
      >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 96, height: 64, display: "flex" }}>
          <div style={{ position: "absolute", left: 6, bottom: 8, width: 52, height: 16, borderRadius: 8, background: "#1E3A8A" }} />
          <div style={{ position: "absolute", left: 44, bottom: 8, width: 52, height: 16, borderRadius: 8, background: "#1E3A8A", transform: "rotate(-45deg)", transformOrigin: "8px 8px" }} />
          <div style={{ position: "absolute", right: 2, top: 0, width: 18, height: 18, borderRadius: "50%", background: "#C2410C" }} />
        </div>
        <div style={{ fontSize: 22, color: "#1E3A8A", fontStyle: "italic" }}>mahuna.is-a.dev</div>
      </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#1c1917", letterSpacing: -2, marginTop: 8 }}>Romaric GBENOU</div>
        <div style={{ fontSize: 28, color: "#57534e", marginTop: 8 }}>Product Builder · Développeur — Cotonou, Bénin</div>
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <div style={{ padding: "8px 16px", borderRadius: 999, background: "#1c1917", color: "white", fontSize: 14, fontWeight: 700 }}>React · Next.js · Laravel</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

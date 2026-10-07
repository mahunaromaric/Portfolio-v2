"use client";

import { useEffect, useState } from "react";
import type { ToastDetail } from "./ActionForm";

type Toast = ToastDetail & { id: number };

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;
      const id = ++n;
      setToasts((t) => [...t.slice(-3), { ...detail, id }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
    };
    window.addEventListener("admin-toast", onToast);
    return () => window.removeEventListener("admin-toast", onToast);
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(360px,calc(100vw-48px))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${
            t.kind === "ok"
              ? "border-emerald-600/30 bg-emerald-950 text-emerald-100"
              : "border-red-600/30 bg-red-950 text-red-100"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

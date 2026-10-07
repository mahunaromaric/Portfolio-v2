"use client";

import { useState } from "react";
import { translateTextAction } from "@/lib/ai/translate";

export function TranslateButton({ sourceName, targetName }: { sourceName: string; targetName: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async (e) => {
        const form = (e.currentTarget as HTMLElement).closest("form");
        if (!form) return;
        const src = form.querySelector(`[name="${sourceName}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
        const dst = form.querySelector(`[name="${targetName}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
        if (!src || !dst || !src.value.trim()) return;
        setLoading(true);
        try {
          const fd = new FormData();
          fd.set("text", src.value);
          const res = await translateTextAction(fd);
          if (res?.text) dst.value = res.text;
        } finally {
          setLoading(false);
        }
      }}
      className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-bold text-ink hover:bg-surface disabled:opacity-50"
      title="Traduire avec DeepL"
    >
      {loading ? "…" : "✨ Traduire"}
    </button>
  );
}

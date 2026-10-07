"use client";

import { useMemo, useState } from "react";
import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { upsertCaseStudyBlock } from "@/lib/actions/projects";

const input =
  "rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none";
const TYPES = ["TEXT", "IMAGE", "IMAGE_GALLERY", "QUOTE", "FEATURES", "TECHNICAL"] as const;

/** Éditeur guidé de bloc case-study : champs par type, sérialisés en JSON. */
export function BlockEditor({
  caseStudyId,
  order,
  media,
}: {
  caseStudyId: string;
  order: number;
  media: { id: string; url: string; type: string }[];
}) {
  const [type, setType] = useState<(typeof TYPES)[number]>("TEXT");
  const [markdown, setMarkdown] = useState("");
  const [mediaId, setMediaId] = useState("");
  const [caption, setCaption] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [listText, setListText] = useState("");

  const images = media.filter((m) => m.type === "IMAGE");
  const content = useMemo(() => {
    switch (type) {
      case "TEXT":
        return JSON.stringify({ markdown });
      case "IMAGE":
        return JSON.stringify({ mediaId, ...(caption.trim() ? { caption: caption.trim() } : {}) });
      case "IMAGE_GALLERY":
        return JSON.stringify({ mediaIds: gallery, ...(caption.trim() ? { caption: caption.trim() } : {}) });
      case "QUOTE":
        return JSON.stringify({ text: quoteText, ...(quoteAuthor.trim() ? { author: quoteAuthor.trim() } : {}) });
      case "FEATURES":
        return JSON.stringify({ items: listText.split("\n").map((s) => s.trim()).filter(Boolean) });
      case "TECHNICAL":
        return JSON.stringify({ points: listText.split("\n").map((s) => s.trim()).filter(Boolean) });
    }
  }, [type, markdown, mediaId, caption, gallery, quoteText, quoteAuthor, listText]);

  const toggleGallery = (id: string) =>
    setGallery((g) => (g.includes(id) ? g.filter((x) => x !== id) : g.length >= 12 ? g : [...g, id]));

  return (
    <ActionForm action={upsertCaseStudyBlock} successMessage="Bloc ajouté." className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <input type="hidden" name="caseStudyId" value={caseStudyId} />
      <input type="hidden" name="content" value={content} />
      <select
        name="type"
        aria-label="Type de bloc"
        value={type}
        onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
        className={input}
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input name="title" placeholder="Titre (optionnel)" aria-label="Titre (optionnel)" className={input} />
      <input name="displayOrder" type="number" defaultValue={order} aria-label="Ordre" className={input} />

      {type === "TEXT" && (
        <textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} required rows={4} placeholder="Texte markdown…" aria-label="Texte markdown" className={`${input} md:col-span-2 font-mono text-xs`} />
      )}
      {type === "IMAGE" && (
        <>
          <select value={mediaId} onChange={(e) => setMediaId(e.target.value)} required aria-label="Image" className={`${input} md:col-span-2`}>
            <option value="" disabled>Choisir une image…</option>
            {images.map((m) => (
              <option key={m.id} value={m.id}>{m.url}</option>
            ))}
          </select>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Légende (optionnel)" aria-label="Légende" className={`${input} md:col-span-2`} />
        </>
      )}
      {type === "IMAGE_GALLERY" && (
        <>
          <div className="md:col-span-2 rounded-xl border border-border bg-bg p-3">
            <p className="mb-2 text-xs font-bold text-secondary">Images ({gallery.length}/12 min 1)</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {images.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-xs text-ink">
                  <input type="checkbox" checked={gallery.includes(m.id)} onChange={() => toggleGallery(m.id)} className="rounded border-border text-accent focus:ring-accent" />
                  <span className="truncate">{m.url}</span>
                </label>
              ))}
              {images.length === 0 && <span className="text-xs text-muted">Aucune image — importez dans Médias.</span>}
            </div>
          </div>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Légende (optionnel)" aria-label="Légende" className={`${input} md:col-span-2`} />
        </>
      )}
      {type === "QUOTE" && (
        <>
          <textarea value={quoteText} onChange={(e) => setQuoteText(e.target.value)} required rows={3} placeholder="Citation…" aria-label="Citation" className={`${input} md:col-span-2`} />
          <input value={quoteAuthor} onChange={(e) => setQuoteAuthor(e.target.value)} placeholder="Auteur (optionnel)" aria-label="Auteur" className={`${input} md:col-span-2`} />
        </>
      )}
      {(type === "FEATURES" || type === "TECHNICAL") && (
        <textarea value={listText} onChange={(e) => setListText(e.target.value)} required rows={4} placeholder="Un élément par ligne…" aria-label="Éléments, un par ligne" className={`${input} md:col-span-2 font-mono text-xs`} />
      )}
      <SubmitButton pendingLabel="Ajout…" className="rounded-full border border-border bg-bg px-4 py-2 text-xs font-bold text-ink hover:bg-surface md:col-span-2">
        Ajouter le bloc
      </SubmitButton>
    </ActionForm>
  );
}

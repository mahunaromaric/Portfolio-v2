import Image from "next/image";
import ReactMarkdown from "react-markdown";

export type CaseBlock = {
  id: string;
  type: "TEXT" | "IMAGE" | "IMAGE_GALLERY" | "QUOTE" | "FEATURES" | "TECHNICAL";
  title: string | null;
  content: unknown;
  displayOrder: number;
};

export function CaseStudyRenderer({
  blocks,
  mediaById,
}: {
  blocks: CaseBlock[];
  mediaById: Map<string, { url: string; alt: string | null }>;
}) {
  if (blocks.length === 0) return null;
  return (
    <div className="flex flex-col">
      {blocks.map((b) => (
        <CaseBlockView key={b.id} block={b} mediaById={mediaById} />
      ))}
    </div>
  );
}

function CaseBlockView({ block, mediaById }: { block: CaseBlock; mediaById: Map<string, { url: string; alt: string | null }> }) {
  const c = block.content as Record<string, unknown> | null;
  return (
    <section className="border-t border-border py-10 first:border-t-0 first:pt-0">
      {block.title && (
        <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
          <span className="mr-2 inline-block h-px w-6 translate-y-[-4px] bg-accent" />
          {block.title}
        </h3>
      )}
      {block.type === "TEXT" && c && typeof c.markdown === "string" && (
        <div className="prose max-w-none prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-secondary prose-headings:font-extrabold prose-headings:tracking-[-0.03em] prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{c.markdown}</ReactMarkdown>
        </div>
      )}
      {block.type === "QUOTE" && c && typeof c.text === "string" && (
        <blockquote className="border-l-2 border-accent pl-6 text-[19px] font-medium leading-relaxed tracking-[-0.02em] text-ink">
          “{c.text}”
          {typeof c.author === "string" && c.author && <cite className="mt-3 block text-[12px] font-bold uppercase tracking-[0.08em] not-italic text-secondary">— {c.author}</cite>}
        </blockquote>
      )}
      {block.type === "FEATURES" && c && Array.isArray(c.items) && (
        <ul className="grid gap-2">
          {c.items.map((item: unknown, i: number) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-secondary">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{String(item)}</span>
            </li>
          ))}
        </ul>
      )}
      {block.type === "TECHNICAL" && c && Array.isArray(c.points) && (
        <ul className="grid gap-2">
          {c.points.map((item: unknown, i: number) => (
            <li key={i} className="flex gap-3 font-mono text-[13px] leading-relaxed text-secondary">
              <span className="text-accent">—</span>
              <span>{String(item)}</span>
            </li>
          ))}
        </ul>
      )}
      {block.type === "IMAGE" && c && typeof c.mediaId === "string" && (() => {
        const m = mediaById.get(c.mediaId);
        if (!m) return <p className="text-sm text-muted">Image introuvable.</p>;
        return (
          <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="relative aspect-[16/10]">
              <Image src={m.url} alt={m.alt || block.title || ""} fill className="object-cover" sizes="100vw" />
            </div>
            {typeof c.caption === "string" && c.caption && <figcaption className="px-4 py-3 text-[12px] text-secondary">{c.caption}</figcaption>}
          </figure>
        );
      })()}
      {block.type === "IMAGE_GALLERY" && c && Array.isArray(c.mediaIds) && (
        <div className="grid grid-cols-2 gap-3">
          {c.mediaIds.map((id: unknown) => {
            const m = typeof id === "string" ? mediaById.get(id) : null;
            if (!m) return null;
            return (
              <div key={String(id)} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface">
                <Image src={m.url} alt={m.alt || ""} fill className="object-cover" sizes="50vw" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

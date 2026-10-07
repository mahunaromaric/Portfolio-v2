import { ArrowUpRight } from "lucide-react";
import { Words } from "./Progressive";

export function SectionHead({ label, title, intro, index }: { label: string; title: string; intro?: string; index?: string }) {
  return (
    <div className="mb-12 flex flex-col gap-5 md:mb-16">
      <div className="flex items-center gap-4">
        {index && <span className="font-mono text-xs font-medium tabular-nums text-muted">{index}</span>}
        <span className="font-serif italic font-normal text-[22px] tracking-wide normal-case text-accent">{label}</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      <div className="max-w-[760px]">
        <h2 className="text-[clamp(30px,4.8vw,48px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink text-balance"><Words text={title} /></h2>
        {intro && <p className="mt-4 max-w-[560px] text-[15px] leading-[1.7] text-secondary">{intro}</p>}
      </div>
    </div>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "group inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-bold tracking-[0.01em] transition-[transform,box-shadow,background-color,border-color,color] duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
  const styles = {
    primary: "bg-ink text-bg hover:opacity-85",
    secondary: "border border-border bg-surface text-ink hover:bg-surfaceElevated",
    ghost: "bg-surface border border-border text-secondary hover:text-ink",
  }[variant];
  return (
    <a href={href} className={`${base} ${styles}`}>
      {children} <ArrowUpRight className="h-3.5 w-3.5 text-accent transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay" aria-hidden />
    </a>
  );
}

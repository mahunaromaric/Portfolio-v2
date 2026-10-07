"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Image as ImageIcon, Settings, Mail, ShieldCheck, Type } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/projets", label: "Projets", Icon: FolderKanban },
  { href: "/admin/medias", label: "Médias", Icon: ImageIcon },
  { href: "/admin/contenu", label: "Contenu", Icon: Settings },
  { href: "/admin/textes", label: "Textes", Icon: Type },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/securite", label: "Sécurité", Icon: ShieldCheck },
];

export function AdminNav({
  linkClassName = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
}: {
  linkClassName?: string;
}) {
  const pathname = usePathname();
  return (
    <>
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${linkClassName} ${active ? "bg-bg text-ink" : "text-secondary hover:bg-bg hover:text-ink"}`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </>
  );
}

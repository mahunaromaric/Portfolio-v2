import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
import { SillonMark } from "@/components/site/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { Toaster } from "@/components/admin/Toaster";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-bg text-ink flex">
      {/* Sidebar fixe — nav scroll, bas toujours visible */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-surface sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-border shrink-0">
          <Link href="/admin" className="inline-flex items-center gap-2 text-ink" aria-label="Admin — accueil">
            <SillonMark className="h-6 w-6" /> <span className="ml-1 text-xs font-bold text-muted">ADMIN</span>
          </Link>
          <p className="mt-1 text-xs text-muted">Product Builder — Gestion</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Administration">
          <AdminNav />
        </nav>
        <div className="p-4 border-t border-border space-y-3 shrink-0 bg-surface">
          <div className="rounded-xl bg-bg p-3 border border-border">
            <div className="text-xs font-bold text-ink truncate">{session.email}</div>
            <div className="text-xs text-muted">Administrateur</div>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-ink">
            <ExternalLink className="h-3 w-3" /> Voir le site
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-ink hover:bg-surface transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="flex lg:hidden items-center justify-between border-b border-border bg-surface px-4 py-3">
          <Link href="/admin" className="inline-flex items-center text-ink" aria-label="Admin — accueil"><SillonMark className="h-6 w-6" /></Link>
          <details className="group relative">
            <summary className="list-none flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-bg">
              <span className="text-xs font-bold group-open:hidden">≡</span>
              <span className="text-xs font-bold hidden group-open:block">✕</span>
              <span className="sr-only">Menu</span>
            </summary>
            <nav className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-surface p-3 shadow-lg space-y-1" aria-label="Administration">
              <AdminNav linkClassName="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors" />
              <div className="pt-2 border-t border-border mt-2">
                <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-accent">Voir le site</Link>
                <form action={logoutAction} className="mt-1">
                  <button className="w-full rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold">Déconnexion</button>
                </form>
              </div>
            </nav>
          </details>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">{children}</main>
        <Toaster />
      </div>
    </div>
  );
}

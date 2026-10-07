import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SillonMark } from "@/components/site/Logo";
import { LoginForm } from "./LoginForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center" aria-label="Romaric GBENOU — accueil">
              <SillonMark className="h-8 w-8" />
            </Link>
            <p className="font-serif italic font-normal text-[22px] tracking-wide text-accent mt-2">{"// admin"}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink mt-1">Connexion sécurisée</h1>
            <p className="text-sm text-secondary mt-2">Accès réservé — RG Atelier</p>
          </div>
          <LoginForm />
          <p className="text-center mt-6">
            <Link href="/" className="text-sm text-muted hover:text-ink transition">← Retour au site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

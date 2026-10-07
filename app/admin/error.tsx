"use client";

import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm" role="alert">
      <h1 className="text-xl font-extrabold tracking-tight text-ink">Une erreur est survenue</h1>
      <p className="max-w-xl text-sm text-secondary break-words">{error.message || "Échec de l’opération. Vérifiez les champs puis réessayez."}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-black"
        >
          Réessayer
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-border bg-bg px-4 py-2 text-sm font-bold text-ink hover:bg-surface"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { beginTotpSetup, confirmTotpSetup } from "@/lib/actions/totp";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function TotpSetup() {
  const [setup, setSetup] = useState<{ secret: string; url: string; qrSvg: string } | null>(null);
  const [pending, start] = useTransition();
  if (!setup) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setSetup(await beginTotpSetup()))}
        className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-black disabled:opacity-50"
      >
        {pending ? "Génération…" : "Activer la 2FA"}
      </button>
    );
  }
  const grouped = setup.secret.replace(/(.{4})/g, "$1 ").trim();
  return (
    <div className="flex flex-col gap-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-secondary">
        <li>Scannez ce QR avec votre application d’authentification.</li>
        <li>Saisissez le code affiché pour confirmer.</li>
      </ol>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="overflow-hidden rounded-2xl border border-border bg-white p-3 [&>svg]:block [&>svg]:h-44 [&>svg]:w-44"
          role="img"
          aria-label="QR code d’activation 2FA"
          dangerouslySetInnerHTML={{ __html: setup.qrSvg }}
        />
        <div className="min-w-0">
          <p className="text-xs font-bold text-secondary">Saisie manuelle (sans scan)</p>
          <p className="mt-1 w-fit rounded-xl border border-border bg-bg px-4 py-3 font-mono text-sm font-bold tracking-widest text-ink break-all">
            {grouped}
          </p>
        </div>
      </div>
      <ActionForm action={confirmTotpSetup} successMessage="Double authentification activée." className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="secret" value={setup.secret} />
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary">Code à 6 chiffres
          <input name="code" required inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={6} pattern="[0-9]{6}" placeholder="123456" aria-label="Code à 6 chiffres" className="rounded-xl border border-border bg-bg px-3 py-2.5 text-center text-lg font-bold tracking-[0.4em] text-ink" />
        </label>
        <SubmitButton pendingLabel="Vérification…" className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-black">
          Confirmer
        </SubmitButton>
      </ActionForm>
    </div>
  );
}

import { db } from "@/prisma/db";
import { getSession } from "@/lib/auth";
import { disableTotp } from "@/lib/actions/totp";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TotpSetup } from "@/components/admin/TotpSetup";

export const dynamic = "force-dynamic";

export default async function AdminSecuritePage() {
  const session = await getSession();
  const admin = session
    ? await db.orm.public.AdminUser.where((u) => u.id.eq(session.adminId)).first()
    : null;
  const enabled = admin?.totpEnabled === true;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Sécurité</h1>
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-ink">Double authentification (TOTP)</h2>
            <p className="mt-1 max-w-xl text-sm text-secondary">
              Connecté en tant que <span className="font-bold text-ink">{session?.email}</span>.{" "}
              {enabled
                ? "La 2FA est active : chaque connexion demandera le code à 6 chiffres."
                : "Recommandé : un code à 6 chiffres sera demandé après le mot de passe."}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${
              enabled ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-bg text-muted"
            }`}
          >
            {enabled ? "Activée" : "Désactivée"}
          </span>
        </div>
        <div className="mt-6">
          {enabled ? (
            <ActionForm action={disableTotp} successMessage="Double authentification désactivée.">
              <SubmitButton
                pendingLabel="…"
                className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent hover:bg-accent hover:text-white"
              >
                Désactiver la 2FA
              </SubmitButton>
            </ActionForm>
          ) : (
            <TotpSetup />
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          Conservez l’accès à votre application d’authentification : sans elle, la reconnexion exigera un accès base de données.
        </p>
      </section>
    </div>
  );
}

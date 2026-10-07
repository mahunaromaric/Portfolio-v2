"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { verifyTotpAction } from "@/lib/actions/totp";
import { SillonMark } from "@/components/site/Logo";
import { Turnstile } from "@/components/Turnstile";

type LoginState = { error?: string; need2fa?: boolean; challenge?: string } | null;

export function LoginForm() {
  const tokenRef = useRef<string | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const dismissed = useRef<string | null>(null);
  const [state, action, pending] = useActionState(
    async (_prev: LoginState, formData: FormData): Promise<LoginState> => {
      if (tokenRef.current) formData.set("turnstileToken", tokenRef.current);
      const res = await loginAction(formData);
      if (res && "need2fa" in res && res.need2fa) return { need2fa: true, challenge: res.challenge };
      return (res as { error?: string } | null) ?? { error: "Erreur inconnue." };
    },
    null,
  );
  useEffect(() => {
    if (state?.need2fa && state.challenge && dismissed.current !== state.challenge) {
      setChallenge(state.challenge);
    }
  }, [state]);

  if (challenge) {
    return (
      <TotpStep
        challenge={challenge}
        onBack={() => {
          dismissed.current = challenge;
          setChallenge(null);
        }}
      />
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4 rounded-2xl sm:rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-[0_16px_40px_rgba(28,25,23,0.08)] overflow-hidden">
      <div className="flex justify-center -mt-2 mb-2">
        <SillonMark className="h-14 w-14" />
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary">
        Email
        <input name="email" type="email" required autoComplete="email" className="rounded-xl border border-border bg-bg px-3 py-3 text-[14px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-accent/20" placeholder="admin@exemple.com" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary">
        Mot de passe
        <input name="password" type="password" required minLength={8} autoComplete="current-password" className="rounded-xl border border-border bg-bg px-3 py-3 text-[14px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-accent/20" placeholder="••••••••" />
      </label>
      <div className="w-full overflow-hidden flex justify-center">
        <div className="scale-[0.85] sm:scale-100 origin-center">
          <Turnstile onToken={(t) => (tokenRef.current = t)} />
        </div>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 dark:text-red-300 dark:bg-red-950 dark:border-red-900">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-ink px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(28,25,23,0.18)] hover:bg-black hover:shadow-[0_12px_32px_rgba(28,25,23,0.22)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all">
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

function TotpStep({ challenge, onBack }: { challenge: string; onBack: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const res = await verifyTotpAction(formData);
      return res ?? { error: "Erreur inconnue." };
    },
    null,
  );
  return (
    <form action={action} className="flex w-full flex-col gap-4 rounded-2xl sm:rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-[0_16px_40px_rgba(28,25,23,0.08)] overflow-hidden">
      <div className="flex justify-center -mt-2 mb-2">
        <SillonMark className="h-14 w-14" />
      </div>
      <div className="text-center">
        <h1 className="text-lg font-extrabold text-ink">Vérification en deux étapes</h1>
        <p className="mt-1 text-sm text-secondary">Saisissez le code à 6 chiffres de votre application d’authentification.</p>
      </div>
      <input type="hidden" name="challenge" value={challenge} />
      <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary">
        Code
        <input
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          minLength={6}
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder="123456"
          autoFocus
          className="rounded-xl border border-border bg-bg px-3 py-3 text-center text-xl font-bold tracking-[0.5em] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-accent/20"
        />
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 dark:text-red-300 dark:bg-red-950 dark:border-red-900">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-ink px-4 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-50 transition-all">
        {pending ? "Vérification..." : "Vérifier"}
      </button>
      <button type="button" onClick={onBack} className="text-sm font-bold text-muted hover:text-ink transition">
        ← Retour
      </button>
    </form>
  );
}

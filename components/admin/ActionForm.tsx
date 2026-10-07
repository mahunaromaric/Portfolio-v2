"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export type ToastDetail = { kind: "ok" | "error"; message: string };

export function toast(detail: ToastDetail) {
  window.dispatchEvent(new CustomEvent<ToastDetail>("admin-toast", { detail }));
}

/** Formulaire d'action serveur avec toast succès/erreur + refresh. Remplace <form action={fn}>. */
export function ActionForm({
  action,
  children,
  className,
  successMessage = "Enregistré.",
}: {
  action: (formData: FormData) => Promise<unknown>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  type FormState = { ok: true } | { ok: false; error: string } | null;
  const [state, formAction] = useActionState(async (_prev: FormState, fd: FormData): Promise<Exclude<FormState, null>> => {
    try {
      await action(fd);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Échec de l’opération." };
    }
  }, null);
  const done = useRef<unknown>(null);
  useEffect(() => {
    if (!state || done.current === state) return;
    done.current = state;
    if (state.ok) {
      toast({ kind: "ok", message: successMessage });
      router.refresh();
    } else {
      toast({ kind: "error", message: state.error });
    }
  }, [state, successMessage, router]);
  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}

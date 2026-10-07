"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "./admin/ActionForm";

export function DeleteButton({
  onDelete,
  label = "Supprimer",
  confirmMessage = "Confirmer la suppression ?",
}: {
  onDelete: () => Promise<{ ok?: boolean; error?: string }>;
  label?: string;
  confirmMessage?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent hover:bg-accent hover:text-white disabled:opacity-50 transition-colors"
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        start(async () => {
          const res = await onDelete();
          if (res.error) toast({ kind: "error", message: res.error });
          else toast({ kind: "ok", message: "Supprimé." });
          router.refresh();
        });
      }}
    >
      <Trash2 className="h-3 w-3" />
      {pending ? "..." : label}
    </button>
  );
}

export function StatusSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => Promise<{ ok?: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select
      value={value}
      disabled={pending}
      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-ink focus:border-accent focus:ring-1 focus:ring-accent"
      onChange={(e) =>
        start(async () => {
          const res = await onChange(e.target.value);
          if (res.error) toast({ kind: "error", message: res.error });
          else toast({ kind: "ok", message: "Statut mis à jour." });
          router.refresh();
        })
      }
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

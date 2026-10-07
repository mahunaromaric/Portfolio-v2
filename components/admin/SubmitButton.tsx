"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Envoi…",
  className = "rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-black",
  ...rest
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className} disabled:opacity-50`} {...rest}>
      {pending ? pendingLabel : children}
    </button>
  );
}

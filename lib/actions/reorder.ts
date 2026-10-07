"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { requireAdmin } from "@/lib/auth";

type Row = { id: string; displayOrder: number };

// `.all()` renvoie un résultat thenable au runtime ; normalisé ici en Promise.
const asRows = (p: unknown) => p as unknown as Promise<Row[]>;

// Échange displayOrder avec le voisin (haut/bas) pour les listes ordonnées.
const handlers: Record<string, {
  list: () => Promise<Row[]>;
  setOrder: (id: string, order: number) => Promise<unknown>;
}> = {
  Project: {
    list: () => asRows(db.orm.public.Project.orderBy((p) => p.displayOrder.asc()).limit(1000).all()),
    setOrder: (id, order) => db.orm.public.Project.where((p) => p.id.eq(id)).update({ displayOrder: order }),
  },
  Service: {
    list: () => asRows(db.orm.public.Service.orderBy((s) => s.displayOrder.asc()).limit(1000).all()),
    setOrder: (id, order) => db.orm.public.Service.where((s) => s.id.eq(id)).update({ displayOrder: order }),
  },
  CollaborationPhase: {
    list: () => asRows(db.orm.public.CollaborationPhase.orderBy((c) => c.displayOrder.asc()).limit(1000).all()),
    setOrder: (id, order) => db.orm.public.CollaborationPhase.where((c) => c.id.eq(id)).update({ displayOrder: order }),
  },
  Experience: {
    list: () => asRows(db.orm.public.Experience.orderBy((e) => e.displayOrder.asc()).limit(1000).all()),
    setOrder: (id, order) => db.orm.public.Experience.where((e) => e.id.eq(id)).update({ displayOrder: order }),
  },
  Education: {
    list: () => asRows(db.orm.public.Education.orderBy((e) => e.displayOrder.asc()).limit(1000).all()),
    setOrder: (id, order) => db.orm.public.Education.where((e) => e.id.eq(id)).update({ displayOrder: order }),
  },
  TechnologyCategory: {
    list: () => asRows(db.orm.public.TechnologyCategory.orderBy((c) => c.displayOrder.asc()).limit(1000).all()),
    setOrder: (id, order) =>
      db.orm.public.TechnologyCategory.where((c) => c.id.eq(id)).update({ displayOrder: order }),
  },
};

export async function moveItem(formData: FormData) {
  await requireAdmin();
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  const h = handlers[table];
  if (!h || !id || (dir !== "up" && dir !== "down")) throw new Error("Déplacement invalide.");
  const rows = await h.list();
  const idx = rows.findIndex((r) => r.id === id);
  const other = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || other < 0 || other >= rows.length) return;
  const a = rows[idx]!;
  const b = rows[other]!;
  await h.setOrder(a.id, b.displayOrder);
  await h.setOrder(b.id, a.displayOrder);
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

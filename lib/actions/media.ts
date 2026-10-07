"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { requireAdmin } from "@/lib/auth";
import { saveUpload, deleteUpload } from "@/lib/storage";

const MAX_SIZE = 5 * 1024 * 1024;
// SVG exclu : script inline exécuté same-origin = XSS stocké. Convertissez en PNG/WebP.
const ALLOWED: Record<string, "IMAGE" | "VIDEO" | "DOCUMENT"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "application/pdf": "DOCUMENT",
};

// Vérifie la signature binaire réelle (le MIME vient du client, donc ne suffit pas).
function sniffedType(bytes: Uint8Array, mime: string): boolean {
  const head = (n: number) => bytes.slice(0, n);
  const eq = (a: Uint8Array, b: number[]) => b.every((v, i) => a[i] === v);
  const str = (n: number) => Buffer.from(head(n)).toString("binary");
  switch (mime) {
    case "image/jpeg":
      return eq(head(3), [0xff, 0xd8, 0xff]);
    case "image/png":
      return eq(head(8), [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/gif":
      return str(6) === "GIF87a" || str(6) === "GIF89a";
    case "image/webp":
      return str(4) === "RIFF" && str(12).slice(8) === "WEBP";
    case "video/mp4":
      return str(12).slice(4, 8) === "ftyp";
    case "video/webm":
      return eq(head(4), [0x1a, 0x45, 0xdf, 0xa3]);
    case "application/pdf":
      return str(5) === "%PDF-";
    default:
      return false;
  }
}

export async function uploadMedia(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Aucun fichier." );
  if (file.size > MAX_SIZE) throw new Error("Fichier trop lourd (max 5 Mo)." );
  const type = ALLOWED[file.type];
  if (!type) throw new Error(`Type non supporté : ${file.type || "inconnu"}.` );
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!sniffedType(bytes, file.type)) throw new Error("Contenu du fichier invalide (signature binaire)." );

  const alt = (formData.get("alt") as string | null)?.slice(0, 500) ?? null;
  const ext = (file.name.split(".").pop()?.toLowerCase().slice(0, 10) || "bin").replace(/[^a-z0-9]/g, "") || "bin";
  const saved = await saveUpload(file, ext);

  await db.orm.public.Media.create({
    bucketKey: saved.bucketKey,
    url: saved.url,
    mimeType: file.type,
    type,
    size: file.size,
    width: null,
    height: null,
    alt,
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return;
}

export async function linkProjectMedia(projectId: string, mediaId: string, opts?: { isCover?: boolean }) {
  await requireAdmin();
  const orderRows = await db.orm.public.ProjectMedia.where((m) => m.projectId.eq(projectId)).all();
  const displayOrder = orderRows.length;
  if (opts?.isCover) {
    // Un seul cover par projet : déclasse les autres
    const current = await db.orm.public.ProjectMedia.where((m) => m.projectId.eq(projectId)).all();
    for (const c of current) {
      if (c.isCover) {
        await db.orm.public.ProjectMedia.where((m) => m.projectId.eq(c.projectId))
          .where((m) => m.mediaId.eq(c.mediaId))
          .update({ isCover: false });
      }
    }
  }
  try {
    await db.orm.public.ProjectMedia.create({ projectId, mediaId, displayOrder, isCover: opts?.isCover ?? false });
  } catch (e) {
    // Double-clic : la liaison existe déjà = état désiré.
    if (!(e instanceof Error && /duplicate key|unique constraint/i.test(e.message))) throw e;
  }
  const project = await db.orm.public.Project.where((p) => p.id.eq(projectId)).first();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  if (project) revalidatePath(`/work/${project.slug}`);
  return;
}

export async function unlinkProjectMedia(projectId: string, mediaId: string) {
  await requireAdmin();
  await db.orm.public.ProjectMedia.where((m) => m.projectId.eq(projectId))
    .where((m) => m.mediaId.eq(mediaId))
    .delete();
  const project = await db.orm.public.Project.where((p) => p.id.eq(projectId)).first();
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  if (project) revalidatePath(`/work/${project.slug}`);
  return { ok: true };
}

export async function deleteMedia(id: string) {
  await requireAdmin();
  const used = await db.orm.public.ProjectMedia.where((m) => m.mediaId.eq(id)).limit(1).all();
  if (used.length > 0) return { error: "Média utilisé par un projet. Détache-le d'abord." };
  const media = await db.orm.public.Media.where((m) => m.id.eq(id)).first();
  await db.orm.public.Media.where((m) => m.id.eq(id)).delete();
  if (media) await deleteUpload(media.bucketKey); // best-effort (S3 ou local)
  revalidatePath("/admin", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

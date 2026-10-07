import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Stockage des médias : S3-compatible en prod, disque local sinon.
 *
 * Prod (toutes requises) : S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 * Optionnelles : S3_REGION (défaut "auto"), S3_PUBLIC_URL (défaut endpoint/bucket path-style).
 * Le bucket doit être public en lecture (policy) — on ne pose pas d'ACL (incompatible R2).
 */

export type SavedUpload = { bucketKey: string; url: string };

function s3Config() {
  const { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, S3_PUBLIC_URL } = process.env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return null;
  return {
    endpoint: S3_ENDPOINT.replace(/\/$/, ""),
    bucket: S3_BUCKET,
    region: S3_REGION || "auto",
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    publicUrl: (S3_PUBLIC_URL || `${S3_ENDPOINT.replace(/\/$/, "")}/${S3_BUCKET}`).replace(/\/$/, ""),
  };
}

export function storageBackend(): "s3" | "local" {
  return s3Config() ? "s3" : "local";
}

let client: S3Client | null = null;
function s3Client() {
  const cfg = s3Config();
  if (!cfg) throw new Error("S3 non configuré");
  if (!client) {
    client = new S3Client({
      endpoint: cfg.endpoint,
      region: cfg.region,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
      forcePathStyle: true,
    });
  }
  return { client, cfg };
}

export async function saveUpload(file: File, ext: string): Promise<SavedUpload> {
  const key = `uploads/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const cfg = s3Config();

  if (cfg) {
    const { client } = s3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: bytes,
        ContentType: file.type || "application/octet-stream",
        ContentLength: bytes.length,
      }),
    );
    return { bucketKey: key, url: `${cfg.publicUrl}/${key}` };
  }

  const absDir = join(process.cwd(), "public", "uploads", String(new Date().getFullYear()));
  await mkdir(absDir, { recursive: true });
  await writeFile(join(process.cwd(), "public", key), bytes);
  return { bucketKey: key, url: `/${key}` };
}

/** Suppression best-effort (ne lève jamais). */
export async function deleteUpload(bucketKey: string): Promise<void> {
  try {
    const cfg = s3Config();
    if (cfg) {
      const { client } = s3Client();
      await client.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: bucketKey }));
      return;
    }
    if (bucketKey.startsWith("uploads/")) {
      await unlink(join(process.cwd(), "public", bucketKey));
    }
  } catch (e) {
    console.warn(`[storage] suppression ignorée pour ${bucketKey}:`, (e as Error).message);
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { SESSION_COOKIE, sessionExpiry, requestMeta, requireAdmin, isLoginRateLimited, recordFailedLogin, clearLoginAttempts } from "@/lib/auth";
import { generateSessionToken, hashToken } from "@/lib/crypto";
import { generateTotpSecret, otpauthUrl, readChallenge, verifyTotp } from "@/lib/totp";

// Étape 2 du login : vérifie le code TOTP du défi, puis ouvre la session.
export async function verifyTotpAction(formData: FormData) {
  const challenge = String(formData.get("challenge") ?? "");
  const code = String(formData.get("code") ?? "");
  const meta = await requestMeta();
  const unverifiedId = Buffer.from(challenge, "base64url").toString("utf8").split(".")[0];
  const admin = unverifiedId
    ? await db.orm.public.AdminUser.where((u) => u.id.eq(unverifiedId)).first()
    : null;
  const adminId = admin ? readChallenge(challenge, admin.passwordHash) : null;
  if (!admin || !adminId) return { error: "Session expirée. Reconnectez-vous." };
  if (await isLoginRateLimited(meta.ipHash, admin.email)) {
    return { error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." };
  }
  if (!admin.totpEnabled || !admin.totpSecret || !verifyTotp(admin.totpSecret, code)) {
    await recordFailedLogin(meta.ipHash, admin.email);
    return { error: "Code incorrect." };
  }
  await clearLoginAttempts(meta.ipHash, admin.email);
  const token = generateSessionToken();
  await db.orm.public.AdminSession.create({
    tokenHash: hashToken(token),
    adminUserId: admin.id,
    expiresAt: sessionExpiry(),
    ipHash: meta.ipHash,
    userAgent: meta.userAgent,
  });
  await db.orm.public.AdminUser.where((u) => u.id.eq(admin.id)).update({
    lastLoginAt: new Date().toISOString(),
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 1 * 24 * 3600,
  });
  redirect("/admin");
}

// Prépare l'activation : génère un secret + QR à confirmer (le secret transite en champ caché signé par la session).
export async function beginTotpSetup() {
  const session = await requireAdmin();
  const admin = await db.orm.public.AdminUser.where((u) => u.id.eq(session.adminId)).first();
  if (!admin) throw new Error("Compte introuvable.");
  const secret = generateTotpSecret();
  const url = otpauthUrl(secret, admin.email);
  const { default: QRCode } = await import("qrcode");
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 2, width: 220 });
  return { secret, url, qrSvg };
}

export async function confirmTotpSetup(formData: FormData) {
  const session = await requireAdmin();
  const secret = String(formData.get("secret") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!verifyTotp(secret, code)) throw new Error("Code incorrect — vérifiez l’heure de votre appareil.");
  await db.orm.public.AdminUser.where((u) => u.id.eq(session.adminId)).update({
    totpSecret: secret,
    totpEnabled: true,
  });
  revalidatePath("/admin", "layout");
  return;
}

export async function disableTotp() {
  const session = await requireAdmin();
  await db.orm.public.AdminUser.where((u) => u.id.eq(session.adminId)).update({
    totpSecret: null,
    totpEnabled: false,
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, generateSessionToken, hashToken } from "@/lib/crypto";
import { issueChallenge } from "@/lib/totp";
import { verifyTurnstile } from "@/lib/turnstile";
import { SESSION_COOKIE, sessionExpiry, requestMeta, requestIp, isLoginRateLimited, recordFailedLogin, clearLoginAttempts } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Email ou mot de passe invalide." };

  const turnstileToken = formData.get("turnstileToken");
  const human = await verifyTurnstile(
    typeof turnstileToken === "string" ? turnstileToken : null,
    await requestIp(),
  );
  if (!human) return { error: "Vérification anti-robot échouée. Veuillez réessayer." };

  const preMeta = await requestMeta();
  if (await isLoginRateLimited(preMeta.ipHash, parsed.data.email)) {
    return { error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." };
  }

  const admin = await db.orm.public.AdminUser.where((u) => u.email.eq(parsed.data.email)).first();
  // Réponse générique anti-énumération (on enregistre quand même la tentative)
  if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    await recordFailedLogin(preMeta.ipHash, parsed.data.email);
    return { error: "Identifiants incorrects." };
  }

  await clearLoginAttempts(preMeta.ipHash, parsed.data.email);
  // 2FA active → défi code à 6 chiffres avant d'ouvrir la session
  if (admin.totpEnabled && admin.totpSecret) {
    return { need2fa: true as const, challenge: issueChallenge(admin.id, admin.passwordHash) };
  }
  const token = generateSessionToken();
  const meta = preMeta;
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

export async function logoutAction() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.orm.public.AdminSession.where((s) => s.tokenHash.eq(hashToken(token))).delete();
  }
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

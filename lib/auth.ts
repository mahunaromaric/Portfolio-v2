import { cookies, headers } from "next/headers";
import { db } from "@/prisma/db";
import { hashToken, hashIp } from "./crypto";

export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";
const SESSION_DAYS = 1;

// Rate-limit login : 4 tentatives échouées max par fenêtre de 15 min (par IP ou par email)
export const LOGIN_MAX_ATTEMPTS = 4;
export const LOGIN_WINDOW_MINUTES = 15;

function loginWindowStartMs(): number {
  return Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000;
}

/** Nombre de tentatives échouées récentes pour cette IP ou cet email. */
export async function countRecentLoginAttempts(ipHash: string | null, email: string): Promise<number> {
  const since = loginWindowStartMs();
  const attempts = await db.orm.public.LoginAttempt.orderBy((a) => a.createdAt.desc()).limit(50).all();
  const lowered = email.toLowerCase();
  return attempts.filter(
    (a) =>
      // createdAt est renvoyé en texte Postgres ("2026-09-15 17:19:21.057+01") : comparaison via timestamps
      new Date(a.createdAt).getTime() >= since &&
      ((ipHash !== null && a.ipHash === ipHash) || (a.email !== null && a.email.toLowerCase() === lowered)),
  ).length;
}

export async function isLoginRateLimited(ipHash: string | null, email: string): Promise<boolean> {
  return (await countRecentLoginAttempts(ipHash, email)) >= LOGIN_MAX_ATTEMPTS;
}

export async function recordFailedLogin(ipHash: string | null, email: string): Promise<void> {
  await db.orm.public.LoginAttempt.create({ ipHash, email });
  // Hygiène : purge les vieilles tentatives (> 1 h)
  const cutoff = Date.now() - 3600 * 1000;
  const old = await db.orm.public.LoginAttempt.orderBy((a) => a.createdAt.asc()).limit(200).all();
  for (const a of old) {
    if (new Date(a.createdAt).getTime() < cutoff) {
      await db.orm.public.LoginAttempt.where((x) => x.id.eq(a.id)).delete();
    } else break;
  }
}

/** Succès : on efface l'historique d'échecs de cette IP / cet email. */
export async function clearLoginAttempts(ipHash: string | null, email: string): Promise<void> {
  const rows = await db.orm.public.LoginAttempt.limit(100).all();
  const lowered = email.toLowerCase();
  for (const a of rows) {
    if ((ipHash !== null && a.ipHash === ipHash) || (a.email !== null && a.email.toLowerCase() === lowered)) {
      await db.orm.public.LoginAttempt.where((x) => x.id.eq(a.id)).delete();
    }
  }
}

export type AdminSessionInfo = {
  adminId: string;
  email: string;
};

export async function getSession(): Promise<AdminSessionInfo | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await db.orm.public.AdminSession.where((s) => s.tokenHash.eq(tokenHash)).first();
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await db.orm.public.AdminSession.where((s) => s.tokenHash.eq(tokenHash)).delete();
    return null;
  }
  const admin = await db.orm.public.AdminUser.where((u) => u.id.eq(session.adminUserId)).first();
  if (!admin) return null;
  return { adminId: admin.id, email: admin.email };
}

export async function requireAdmin(): Promise<AdminSessionInfo> {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");
  return session;
}

export function sessionExpiry(): string {
  return new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000).toISOString();
}

export async function requestMeta(): Promise<{ ipHash: string | null; userAgent: string | null }> {
  const ip = await requestIp();
  try {
    const h = await headers();
    return { ipHash: ip ? hashIp(ip) : null, userAgent: h.get("user-agent")?.slice(0, 500) ?? null };
  } catch {
    return { ipHash: ip ? hashIp(ip) : null, userAgent: null };
  }
}

/** IP cliente : préfère x-real-ip (posée par notre infra), sinon XFF moins les sauts de confiance. */
export async function requestIp(): Promise<string | null> {
  try {
    const h = await headers();
    const real = h.get("x-real-ip")?.trim();
    if (real) return real;
    const trusted = Math.max(0, Number(process.env.TRUSTED_PROXIES ?? 1) || 0);
    const xff = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (xff.length === 0) return null;
    return xff[Math.max(0, xff.length - 1 - trusted)] ?? null;
  } catch {
    return null;
  }
}

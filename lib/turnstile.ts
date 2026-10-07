/**
 * Vérification serveur Cloudflare Turnstile.
 * Si TURNSTILE_SECRET_KEY n'est pas configurée (dev local), la vérification
 * est ignorée avec un avertissement — jamais en production.
 */
export async function verifyTurnstile(token: string | null | undefined, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY manquante en production : rejet.");
      return false;
    }
    console.warn("[turnstile] pas de clé secrète : vérification ignorée (dev uniquement).");
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

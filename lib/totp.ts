import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// TOTP RFC 6238 (SHA-1, 30s, 6 chiffres, fenêtre ±1) sans dépendance.

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(bytes = 20): string {
  const raw = randomBytes(bytes);
  let out = "";
  let bits = 0;
  let acc = 0;
  for (const b of raw) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += B32[(acc >> bits) & 31];
    }
  }
  if (bits > 0) out += B32[(acc << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/=+$/, "").replace(/[^A-Z2-7]/g, "");
  const out: number[] = [];
  let bits = 0;
  let acc = 0;
  for (const ch of clean) {
    acc = (acc << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((acc >> bits) & 0xff);
    }
  }
  return Buffer.from(out);
}

function hotp(secret: Buffer, counter: bigint): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(counter);
  const h = createHmac("sha1", secret).update(msg).digest();
  const o = h[h.length - 1]! & 0x0f;
  const code = ((h[o]! & 0x7f) << 24) | (h[o + 1]! << 16) | (h[o + 2]! << 8) | h[o + 3]!;
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secretB32: string, code: string, window = 1): boolean {
  const clean = code.replace(/[\s-]/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  let secret: Buffer;
  try {
    secret = base32Decode(secretB32);
  } catch {
    return false;
  }
  if (secret.length === 0) return false;
  const t = Math.floor(Date.now() / 30_000);
  for (let d = -window; d <= window; d++) {
    const a = Buffer.from(hotp(secret, BigInt(t + d)), "utf8");
    const b = Buffer.from(clean, "utf8");
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export function otpauthUrl(secret: string, account: string, issuer = "portfolio-v2"): string {
  const enc = encodeURIComponent;
  return `otpauth://totp/${enc(issuer)}:${enc(account)}?secret=${secret}&issuer=${enc(issuer)}&digits=6&period=30`;
}

// Défi pré-2FA : stateless, signé par le hash du mot de passe, 5 min.
export function issueChallenge(adminId: string, key: string): string {
  const exp = Date.now() + 5 * 60_000;
  const sig = createHmac("sha256", key).update(`${adminId}.${exp}`).digest("hex");
  return Buffer.from(`${adminId}.${exp}.${sig}`, "utf8").toString("base64url");
}

export function readChallenge(challenge: string, key: string): string | null {
  try {
    const [adminId, expStr, sig] = Buffer.from(challenge, "base64url").toString("utf8").split(".");
    if (!adminId || !expStr || !sig) return null;
    if (Date.now() > Number(expStr)) return null;
    const expect = createHmac("sha256", key).update(`${adminId}.${expStr}`).digest("hex");
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expect, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return adminId;
  } catch {
    return null;
  }
}

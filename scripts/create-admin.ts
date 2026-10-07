import "dotenv/config";
import { db } from "../prisma/db";
import { hashPassword } from "../lib/crypto";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: npx tsx scripts/create-admin.ts <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Mot de passe : 8 caractères minimum.");
  process.exit(1);
}

const existing = await db.orm.public.AdminUser.where((u) => u.email.eq(email)).first();
if (existing) {
  console.error("Un admin existe déjà avec cet email.");
  await db.close();
  process.exit(1);
}

await db.orm.public.AdminUser.create({ email, passwordHash: await hashPassword(password) });
console.log(`Admin créé : ${email}`);
await db.close();

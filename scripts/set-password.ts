import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/lib/password";

/**
 * Admin helper: set (or reset) a user's password, optionally renaming their
 * email at the same time — e.g. to claim the data created under the
 * pre-auth seeded dev user:
 *
 *   npm run user:set-password -- dev@al-lisan.local "a-strong-password" you@example.com
 *
 * The new email is a plain third argument on purpose: in PowerShell, `--`
 * is swallowed by PowerShell itself, so npm then claims a `--email` flag as
 * its *own* config option and the script never sees it (confirmed live).
 * `--email <x>` / `--email=<x>` still work where the shell passes them.
 *
 * Signs the user out everywhere (deletes their sessions), since a password
 * reset should invalidate any session opened with the old one.
 */

async function main() {
  const args = process.argv.slice(2);
  let newEmail: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email") newEmail = args[++i];
    else if (args[i].startsWith("--email=")) newEmail = args[i].slice("--email=".length);
    else positional.push(args[i]);
  }
  const [email, password, positionalNewEmail] = positional;
  newEmail ??= positionalNewEmail;
  if (!email || !password || positional.length > 3 || (newEmail !== undefined && !newEmail.includes("@"))) {
    console.error("Usage: npm run user:set-password -- <email> <password> [new-email]");
    process.exit(1);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const user = await db.users.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      console.error(`No user with email ${email}`);
      process.exit(1);
    }
    await db.$transaction([
      db.users.update({
        where: { id: user.id },
        data: { password_hash: await hashPassword(password), ...(newEmail ? { email: newEmail.toLowerCase() } : {}) },
      }),
      db.sessions.deleteMany({ where: { user_id: user.id } }),
    ]);
    console.log(`Password set for ${newEmail?.toLowerCase() ?? user.email} (all existing sessions signed out).`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

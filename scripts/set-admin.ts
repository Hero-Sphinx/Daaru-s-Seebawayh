import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Admin helper: make a user an admin (they get the Admin tab and can unlock
 * class flashcard decks at /admin), or take it away with "remove":
 *
 *   npm run user:set-admin -- you@example.com
 *   npm run user:set-admin -- you@example.com remove
 *
 * Plain positional arguments on purpose — PowerShell swallows `--flags`
 * meant for the script (see set-password.ts). The change applies on the
 * user's next page load; no need to sign out.
 */

async function main() {
  const [email, action, ...extra] = process.argv.slice(2);
  if (!email || !email.includes("@") || (action !== undefined && action !== "remove") || extra.length > 0) {
    console.error("Usage: npm run user:set-admin -- <email> [remove]");
    process.exit(1);
  }
  const makeAdmin = action !== "remove";

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const user = await db.users.findUnique({ where: { email: email.toLowerCase() }, select: { id: true, email: true } });
    if (!user) {
      console.error(`No user with email ${email}`);
      process.exit(1);
    }
    await db.users.update({ where: { id: user.id }, data: { is_admin: makeAdmin } });
    console.log(makeAdmin ? `${user.email} is now an admin.` : `${user.email} is no longer an admin.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

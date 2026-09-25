import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prismaClient: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const db = global.prismaClient ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prismaClient = db;
}

export default db;

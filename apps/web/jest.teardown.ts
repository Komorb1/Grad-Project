import { prisma, pgPool } from "@/lib/prisma";

export default async function globalTeardown() {
  await prisma.$disconnect();
  await pgPool.end();
}
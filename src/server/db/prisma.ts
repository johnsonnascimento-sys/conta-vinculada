import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient();
}

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!global.prismaGlobal) {
    global.prismaGlobal = createPrismaClient();
  }

  return global.prismaGlobal;
}

export function isDatabaseEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

import { PrismaClient } from '@prisma/client'
import { withOptimize } from "@prisma/extension-optimize";

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

let prismaInstance: any;

if (!globalForPrisma.prisma) {
  const client = new PrismaClient();
  prismaInstance = client.$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY! }));
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} else {
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
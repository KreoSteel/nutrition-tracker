import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient;

if (!globalForPrisma.prisma) {
  prismaInstance = new PrismaClient({
    log: ['error', 'warn'],
    // Add connection configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} else {
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
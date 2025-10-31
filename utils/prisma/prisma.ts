import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { 
  prisma: ReturnType<typeof createPrismaClient> | undefined 
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown and cleanup in development to prevent connection leaks
if (process.env.NODE_ENV !== "production") {
  // Cleanup on process exit
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  // Cleanup on SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  // Cleanup on SIGTERM
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { withOptimize } from "@prisma/extension-optimize";

const globalForPrisma = global as unknown as { prisma: any };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "warn", "error"],
  })
    .$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY! }))
    .$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
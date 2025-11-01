import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const globalForPrisma = globalThis as unknown as { 
  prisma: ReturnType<typeof createPrismaClient> | undefined 
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
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

// Helper function to retry database operations with exponential backoff
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      
      // Check if it's a retryable error (connection or pool errors)
      const isRetryableError = 
        (error instanceof PrismaClientKnownRequestError && 
         (error.code === 'P1001' || error.code === 'P2024')) ||
        (error instanceof Error && 
         (error.message.includes('connection pool') || 
          error.message.includes('P2024') ||
          error.message.includes('P1001') ||
          error.message.includes('Can\'t reach database server') ||
          error.message.includes('Timed out fetching') ||
          error.message.includes('Connection')));
      
      if (isRetryableError && attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a retryable error or max retries reached, throw
      throw error;
    }
  }
  
  throw lastError;
}

export default prisma;

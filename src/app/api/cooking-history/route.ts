import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma/prisma";
import { ZodError } from "zod";
import {
   CookingHistoryQuerySchema,
   CreateCookingHistorySchema,
} from "../../../../utils/schemas";

export async function GET(req: NextRequest) {
   try {
      const { searchParams } = new URL(req.url);
      const queryParams = CookingHistoryQuerySchema.parse(
         Object.fromEntries(searchParams.entries())
      );

      const search = queryParams.search?.trim();
      const where = search
         ? {
              OR: [
                 {
                    recipe: {
                       name: { contains: search, mode: "insensitive" as const },
                    },
                 },
              ],
           }
         : {};

      const sortBy = queryParams.sortBy;
      const sortOrder = queryParams.sortOrder;
      const limit = queryParams.limit ?? 20;

      const cookingHistory = await prisma.cookingHistory.findMany({
         where,
         include: {
            recipe: true,
         },
         take: limit + 1,
         ...(queryParams.cursor && queryParams.cursor !== ""
            ? {
                 cursor: {
                    id: queryParams.cursor,
                 },
                 skip: 1,
              }
            : {}),

         orderBy:
            sortBy && sortOrder
               ? { [sortBy]: sortOrder }
               : { cookedAt: "desc" },
      });

      const hasMore = cookingHistory.length > limit;
      const data = hasMore ? cookingHistory.slice(0, limit) : cookingHistory;
      const nextCursor =
         hasMore && data.length > 0 ? data[data.length - 1].id : null;
      const totalCooks = await prisma.cookingHistory.count({ where });

      return NextResponse.json({
         data,
         nextCursor,
         hasMore,
         totalCooks,
      });
   } catch (error) {
      if (error instanceof ZodError) {
         return NextResponse.json(
            { error: "Invalid query parameters", details: error.issues },
            { status: 400 }
         );
      }
      return NextResponse.json(
         { error: "Failed to fetch cooking history" },
         { status: 500 }
      );
   }
}

export async function POST(req: NextRequest) {
   try {
      const body = await req.json();
      const validatedData = CreateCookingHistorySchema.parse(body);
      const cookingHistory = await prisma.cookingHistory.create({
         data: validatedData,
         include: {
            recipe: true,
         },
      });
      return NextResponse.json(cookingHistory);
   } catch (error) {
      if (error instanceof ZodError) {
         return NextResponse.json(
            { error: "Invalid cooking history data", details: error.issues },
            { status: 400 }
         );
      }
      return NextResponse.json(
         { error: "Failed to create cooking history" },
         { status: 500 }
      );
   }
}

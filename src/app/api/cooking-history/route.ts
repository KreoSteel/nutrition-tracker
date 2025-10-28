import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../utils/prisma/prisma";
import { startOfDay, endOfDay } from "date-fns";
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
      const where = {
         ...(queryParams.startDate || queryParams.endDate
            ? {
                 cookedAt: {
                    ...(queryParams.startDate && {
                       gte: startOfDay(queryParams.startDate),
                    }),
                    ...(queryParams.endDate && {
                       lte: endOfDay(queryParams.endDate),
                    }),
                 },
              }
            : {}),
         ...(search
            ? {
                 recipe: {
                    name: { contains: search, mode: "insensitive" as const },
                 },
              }
            : {}),
      };

      const sortBy = queryParams.sortBy;
      const sortOrder = queryParams.sortOrder;
      const limit = queryParams.limit ?? 20;

      const cookingHistory = await prisma.cookingHistory.findMany({
         where,
         include: {
            recipe: {
               include: {
                  ingredients: {
                     include: {
                        ingredient: {
                           select: {
                              id: true,
                              name: true,
                              caloriesPer100g: true,
                              proteinPer100g: true,
                              carbsPer100g: true,
                              fatPer100g: true,
                              category: true,
                              isCustom: true,
                              createdAt: true,
                           },
                        },
                     },
                  },
               },
            },
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

      const recipeCounts = new Map<string, number>();

      const allCookingHistory = await prisma.cookingHistory.groupBy({
         by: ["recipeId"],
         where,
         _count: { recipeId: true },
      });

      allCookingHistory.forEach((entry: { recipeId: string; _count: { recipeId: number } }) => {
         recipeCounts.set(entry.recipeId, entry._count.recipeId);
      });

      const recentCookingHistoryLimit = 3;
      const recentCookingHistory = await prisma.cookingHistory.findMany({
         where,
         include: {
            recipe: {
               include: {
                  ingredients: {
                     include: {
                        ingredient: {
                           select: {
                              id: true,
                              name: true,
                              caloriesPer100g: true,
                              proteinPer100g: true,
                              carbsPer100g: true,
                              fatPer100g: true,
                              category: true,
                              isCustom: true,
                              createdAt: true,
                           },
                        },
                     },
                  },
               },
            },
         },
         orderBy: { cookedAt: "desc" },
         take: recentCookingHistoryLimit,
         cacheStrategy: {
            swr: 60,
            ttl: 60,
          },
      });
      const transformedRecentCookingHistory = recentCookingHistory.map(
         (history: typeof recentCookingHistory[0]) => ({
            ...history,
            recipe: {
               ...history.recipe,
               timesCooked: recipeCounts.get(history.recipeId) || 0,
            },
         })
      );

      const hasMore = cookingHistory.length > limit;
      const data = hasMore ? cookingHistory.slice(0, limit) : cookingHistory;
      const nextCursor =
         hasMore && data.length > 0 ? data[data.length - 1].id : null;
      const totalCooks = await prisma.cookingHistory.count({ where });

      const transformedData = data.map((cooking: typeof data[0]) => ({
         ...cooking,
         recipe: {
            ...cooking.recipe,
            timesCooked: recipeCounts.get(cooking.recipeId) || 0,
         },
      }));

      return NextResponse.json({
         data: transformedData,
         nextCursor,
         hasMore,
         totalCooks,
         recentCookingHistory: transformedRecentCookingHistory,
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
            recipe: {
               include: {
                  ingredients: {
                     include: {
                        ingredient: {
                           select: {
                              id: true,
                              name: true,
                              caloriesPer100g: true,
                              proteinPer100g: true,
                              carbsPer100g: true,
                              fatPer100g: true,
                              category: true,
                              isCustom: true,
                              createdAt: true,
                           },
                        },
                     },
                  },
               },
            },
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

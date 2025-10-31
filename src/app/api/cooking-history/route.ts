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

      const recipeInclude = {
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
      };

      // Use transaction to efficiently manage connections and run queries together
      const [cookingHistory, allCookingHistory, totalCooks] = await prisma.$transaction([
         prisma.cookingHistory.findMany({
            where,
            include: {
               recipe: recipeInclude,
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
         }),
         prisma.cookingHistory.groupBy({
            by: ["recipeId"],
            where,
            _count: { recipeId: true },
            orderBy: { _count: { recipeId: "desc" } },
         }),
         prisma.cookingHistory.count({ where }),
      ]);

      // Build recipe counts map
      const recipeCounts = new Map<string, number>();
      allCookingHistory.forEach((entry) => {
         const e = entry as { recipeId: string; _count: { recipeId: number } };
         recipeCounts.set(e.recipeId, e._count.recipeId);
      });

      // Only fetch recent cooking history separately if we need 3 items but limit is small
      // For dashboard (limit=1), we need all 3 recent items, so fetch separately
      // For larger limits, reuse data from main query
      let recentCookingHistory;
      const recentCookingHistoryLimit = 3;
      if (limit >= recentCookingHistoryLimit && cookingHistory.length >= recentCookingHistoryLimit) {
         // Reuse data from main query to avoid extra database call
         recentCookingHistory = cookingHistory.slice(0, recentCookingHistoryLimit).map((history) => ({
            ...history,
            recipe: {
               ...history.recipe,
               timesCooked: recipeCounts.get(history.recipeId) || 0,
            },
         }));
      } else {
         // Fetch separately for dashboard requests (limit=1) or when we don't have enough data
         recentCookingHistory = await prisma.cookingHistory.findMany({
            where,
            include: {
               recipe: recipeInclude,
            },
            orderBy: { cookedAt: "desc" },
            take: recentCookingHistoryLimit,
         });
         recentCookingHistory = recentCookingHistory.map((history) => ({
            ...history,
            recipe: {
               ...history.recipe,
               timesCooked: recipeCounts.get(history.recipeId) || 0,
            },
         }));
      }

      const hasMore = cookingHistory.length > limit;
      const data = hasMore ? cookingHistory.slice(0, limit) : cookingHistory;
      const nextCursor =
         hasMore && data.length > 0 ? data[data.length - 1].id : null;

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
         recentCookingHistory: recentCookingHistory,
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

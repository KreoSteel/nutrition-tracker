import { NextRequest, NextResponse } from "next/server";
import { calculateCookingStreak } from "../../../../../utils/calculations/cookingHistory";
import { startOfDay, startOfWeek } from "date-fns";
import prisma from "../../../../../utils/prisma/prisma";
import { CookingHistoryResponse } from "../../../../../utils/schemas";

export async function GET(req: NextRequest) {
   try {
      const today = startOfDay(new Date());
      const weekStart = startOfWeek(today);

      const [
         totalCooks,
         todayCooks,
         thisWeekCooks,
         cookingHistoryForStreak,
         mostCookedRecipeResults,
      ] = await prisma.$transaction([
         prisma.cookingHistory.count(),

         prisma.cookingHistory.count({
            where: {
               cookedAt: {
                  gte: today,
                  lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
               },
            },
         }),

         prisma.cookingHistory.count({
            where: {
               cookedAt: { gte: weekStart },
            },
         }),

         prisma.cookingHistory.findMany({
            select: { cookedAt: true },
            orderBy: { cookedAt: "desc" },
            take: 100,
         }),

         prisma.cookingHistory.groupBy({
            by: ["recipeId"],
            _count: { recipeId: true },
            orderBy: { _count: { recipeId: "desc" } },
            take: 1,
         }),
      ]);

      let mostCookedRecipe = null;
      if (mostCookedRecipeResults.length > 0) {
         const result = mostCookedRecipeResults[0] as {
            recipeId: string;
            _count: { recipeId: number };
         };
         const recipe = await prisma.recipe.findUnique({
            where: { id: result.recipeId },
            select: { name: true },
         });
         mostCookedRecipe = recipe
            ? { name: recipe.name, count: result._count.recipeId }
            : null;
      }

      const currentStreak = calculateCookingStreak(
         cookingHistoryForStreak.map((history) => ({
            cookedAt: history.cookedAt,
            recipe: { name: "" },
         })) as unknown as CookingHistoryResponse[]
      );

      const stats = {
         totalCooks,
         todayCooks,
         thisWeekCooks,
         currentStreak,
         mostCookedRecipe,
         weeklyAverage: thisWeekCooks / 7,
      };

      return NextResponse.json(stats);
   } catch (error) {
      console.error("Error fetching cooking history stats:", error);
      return NextResponse.json(
         { error: "Failed to fetch cooking history stats" },
         { status: 500 }
      );
   }
}

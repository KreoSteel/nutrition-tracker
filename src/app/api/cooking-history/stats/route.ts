import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../utils/prisma/prisma";
import { startOfDay, startOfWeek, isSameDay } from "date-fns";
import { calculateCookingStreak } from "../../../../../utils/calculations/cookingHistory";

export async function GET(req: NextRequest) {
   try {
      const searchParams = new URLSearchParams(req.url);
      const period = searchParams.get("period") || "week";

      const cookingHistory = await prisma.cookingHistory.findMany({
         include: {
            recipe: {
               include: {
                  ingredients: {
                     include: {
                        ingredient: true,
                     },
                  },
               },
            },
         },
         orderBy: { cookedAt: "desc" },
      });

      const currentStreak = calculateCookingStreak(cookingHistory);

      const today = startOfDay(new Date());
      const weekStart = startOfWeek(today);

      const todayCooks = cookingHistory.filter(cooking => isSameDay(cooking.cookedAt, today)).length

      const thisWeekCooks = cookingHistory.filter(
         (cooking) => cooking.cookedAt >= weekStart
      ).length;

      const recipeCounts = cookingHistory.reduce((acc, cooking) => {
         const recipeName = cooking.recipe.name;
         acc[recipeName] = (acc[recipeName] || 0) + 1;
         return acc;
      }, {} as Record<string, number>);

      const entries = Object.entries(recipeCounts);
      const sortedEntries = entries.sort(([, a], [, b]) => b - a);
      const mostCookedRecipe = sortedEntries[0];

      const stats = {
         totalCooks: cookingHistory.length,
         todayCooks,
         thisWeekCooks,
         currentStreak,
         mostCookedRecipe: mostCookedRecipe
            ? {
                 name: mostCookedRecipe[0],
                 count: mostCookedRecipe[1],
              }
            : null,
         weeklyAverage: thisWeekCooks / 7,
      };

      return NextResponse.json(stats);
   } catch (error) {
      return NextResponse.json(
         { error: "Failed to fetch cooking history stats" },
         { status: 500 }
      );
   }
}

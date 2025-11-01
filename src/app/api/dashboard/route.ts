import { NextResponse } from "next/server";
import prisma from "../../../../utils/prisma/prisma";
import { startOfDay, startOfWeek, endOfWeek } from "date-fns";
import { calculateCookingStreak } from "../../../../utils/calculations/cookingHistory";
import { calculateRecipeNutritionData } from "../../../../utils/calculations/nutrition";
import { CookingHistoryResponse } from "../../../../utils/schemas";

export async function GET() {
  try {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const dailyStartDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const dailyEndDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

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

    // Use interactive transaction with timeout to work better with PgBouncer
    // Interactive transactions work better than batch transactions with connection poolers
    const result = await prisma.$transaction(async (tx) => {
      // Batch 1: Recipe data
      const [totalRecipes, recentRecipes] = await Promise.all([
        tx.recipe.count(),
        tx.recipe.findMany({
          take: 4,
          orderBy: { createdAt: "desc" },
          ...recipeInclude,
        }),
      ]);

      // Batch 2: Cooking stats (can be parallelized)
      const [totalCooks, todayCooks, thisWeekCooks, cookingHistoryForStreak, mostCookedRecipeResults] = await Promise.all([
        tx.cookingHistory.count(),
        tx.cookingHistory.count({
          where: {
            cookedAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        }),
        tx.cookingHistory.count({
          where: {
            cookedAt: { gte: weekStart },
          },
        }),
        tx.cookingHistory.findMany({
          select: { cookedAt: true },
          orderBy: { cookedAt: "desc" },
          take: 100,
        }),
        tx.cookingHistory.groupBy({
          by: ["recipeId"],
          _count: { recipeId: true },
          orderBy: { _count: { recipeId: "desc" } },
          take: 1,
        }),
      ]);

      // Batch 3: Recent cooking history and recipe counts
      const [recentCookingHistoryRaw, recipeCountsRaw] = await Promise.all([
        tx.cookingHistory.findMany({
          take: 3,
          orderBy: { cookedAt: "desc" },
          include: {
            recipe: recipeInclude,
          },
        }),
        tx.cookingHistory.groupBy({
          by: ["recipeId"],
          _count: { recipeId: true },
          orderBy: { _count: { recipeId: "desc" } },
        }),
      ]);

      // Batch 4: Weekly nutrition data
      const weeklyCookingHistoryRaw = await tx.cookingHistory.findMany({
        where: {
          cookedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        select: {
          cookedAt: true,
          recipe: {
            select: {
              ingredients: {
                select: {
                  ingredientId: true,
                  quantityGrams: true,
                  ingredient: {
                    select: {
                      caloriesPer100g: true,
                      proteinPer100g: true,
                      carbsPer100g: true,
                      fatPer100g: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        totalRecipes,
        recentRecipes,
        totalCooks,
        todayCooks,
        thisWeekCooks,
        cookingHistoryForStreak,
        mostCookedRecipeResults,
        recentCookingHistoryRaw,
        recipeCountsRaw,
        weeklyCookingHistoryRaw,
      };
    }, {
      timeout: 30000, // 30 second timeout
      maxWait: 10000, // Wait max 10 seconds for connection
    });

    const { 
      totalRecipes,
      recentRecipes,
      totalCooks,
      todayCooks,
      thisWeekCooks,
      cookingHistoryForStreak,
      mostCookedRecipeResults,
      recentCookingHistoryRaw,
      recipeCountsRaw,
      weeklyCookingHistoryRaw,
    } = result;

    const recipeCounts = new Map<string, number>();
    recipeCountsRaw.forEach((entry) => {
      const e = entry as { recipeId: string; _count: { recipeId: number } };
      recipeCounts.set(e.recipeId, e._count.recipeId);
    });

    const recentCookingHistory = recentCookingHistoryRaw.map((history) => ({
      ...history,
      recipe: {
        ...history.recipe,
        timesCooked: recipeCounts.get(history.recipeId) || 0,
      },
    }));

    let mostCookedRecipe = null;
    if (mostCookedRecipeResults.length > 0) {
      const result = mostCookedRecipeResults[0] as {
        recipeId: string;
        _count: { recipeId: number };
      };
      const recipeFromRecent = recentCookingHistoryRaw.find(h => h.recipeId === result.recipeId)?.recipe;
      const recipeFromRecipes = recentRecipes.find(r => r.id === result.recipeId);
      
      if (recipeFromRecent) {
        mostCookedRecipe = { name: recipeFromRecent.name, count: result._count.recipeId };
      } else if (recipeFromRecipes) {
        mostCookedRecipe = { name: recipeFromRecipes.name, count: result._count.recipeId };
      } else {
        // Last resort: fetch separately (should be rare)
        const recipe = await prisma.recipe.findUnique({
          where: { id: result.recipeId },
          select: { name: true },
        });
        mostCookedRecipe = recipe
          ? { name: recipe.name, count: result._count.recipeId }
          : null;
      }
    }

    const currentStreak = calculateCookingStreak(
      cookingHistoryForStreak.map((history: { cookedAt: Date }) => ({
        cookedAt: history.cookedAt,
        recipe: { name: "" },
      })) as unknown as CookingHistoryResponse[]
    );

    const dailyCookingHistory = weeklyCookingHistoryRaw.filter(
      (cooking) =>
        cooking.cookedAt >= dailyStartDate && cooking.cookedAt <= dailyEndDate
    );

    const totalNutritionPerWeek = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    weeklyCookingHistoryRaw.forEach((cooking: typeof weeklyCookingHistoryRaw[0]) => {
      const recipeNutrition = calculateRecipeNutritionData(cooking.recipe);
      totalNutritionPerWeek.calories += recipeNutrition.calories;
      totalNutritionPerWeek.protein += recipeNutrition.protein;
      totalNutritionPerWeek.carbs += recipeNutrition.carbs;
      totalNutritionPerWeek.fat += recipeNutrition.fat;
    });

    const totalNutritionDaily = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    dailyCookingHistory.forEach((cooking: typeof dailyCookingHistory[0]) => {
      const recipeNutrition = calculateRecipeNutritionData(cooking.recipe);
      totalNutritionDaily.calories += recipeNutrition.calories;
      totalNutritionDaily.protein += recipeNutrition.protein;
      totalNutritionDaily.carbs += recipeNutrition.carbs;
      totalNutritionDaily.fat += recipeNutrition.fat;
    });

    totalNutritionPerWeek.calories = Number(totalNutritionPerWeek.calories.toFixed(1));
    totalNutritionPerWeek.protein = Number(totalNutritionPerWeek.protein.toFixed(1));
    totalNutritionPerWeek.carbs = Number(totalNutritionPerWeek.carbs.toFixed(1));
    totalNutritionPerWeek.fat = Number(totalNutritionPerWeek.fat.toFixed(1));

    totalNutritionDaily.calories = Number(totalNutritionDaily.calories.toFixed(1));
    totalNutritionDaily.protein = Number(totalNutritionDaily.protein.toFixed(1));
    totalNutritionDaily.carbs = Number(totalNutritionDaily.carbs.toFixed(1));
    totalNutritionDaily.fat = Number(totalNutritionDaily.fat.toFixed(1));

    return NextResponse.json({
      totalRecipes,
      recentRecipes,
      
      cookingStats: {
        totalCooks,
        todayCooks,
        thisWeekCooks,
        currentStreak,
        mostCookedRecipe,
        weeklyAverage: thisWeekCooks / 7,
      },
      
      recentCookingHistory,
      
      weeklyNutrition: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        dayStart: dailyStartDate.toISOString(),
        dayEnd: dailyEndDate.toISOString(),
        totalNutritionPerWeek,
        totalMeals: weeklyCookingHistoryRaw.length,
        totalNutritionDaily,
        totalMealsDaily: dailyCookingHistory.length,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

import { endOfWeek, startOfWeek } from "date-fns";
import { NextResponse } from "next/server";
import prisma from "../../../../../utils/prisma/prisma";
import { calculateRecipeNutritionData } from "../../../../../utils/calculations/nutrition";

export async function GET() {
   try {
      const weekStartDate = startOfWeek(new Date());
      const weekEndDate = endOfWeek(new Date());

      const today = new Date();
      const dailyStartDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
      const dailyEndDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

      // Fetch weekly data once (includes daily data since daily is within weekly)
      // Use select to only fetch needed fields for better performance
      const weeklyCookingHistory = await prisma.cookingHistory.findMany({
         where: {
            cookedAt: {
               gte: weekStartDate,
               lte: weekEndDate,
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

      // Filter daily data from weekly data (more efficient than separate query)
      const dailyCookingHistory = weeklyCookingHistory.filter(
         (cooking) =>
            cooking.cookedAt >= dailyStartDate && cooking.cookedAt <= dailyEndDate
      );

      const totalNutritionPerWeek = {
         calories: 0,
         protein: 0,
         carbs: 0,
         fat: 0,
      };
      weeklyCookingHistory.forEach((cooking: typeof weeklyCookingHistory[0]) => {
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
        weekStart: weekStartDate.toISOString(),
        weekEnd: weekEndDate.toISOString(),
        dayStart: dailyStartDate.toISOString(),
        dayEnd: dailyEndDate.toISOString(),
        totalNutritionPerWeek,
        totalMeals: weeklyCookingHistory.length,
        totalNutritionDaily,
        totalMealsDaily: dailyCookingHistory.length,
      });
   } catch (error) {
      console.error("Error fetching nutrition data:", error);
      return NextResponse.json(
         { error: "Failed to fetch nutrition data" },
         { status: 500 }
      );
   }
}

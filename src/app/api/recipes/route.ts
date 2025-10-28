import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../utils/prisma/prisma";
import { calculateRecipeNutritionData } from "../../../../utils/calculations/nutrition";
import {
   CreateRecipeSchema,
   RecipeQuerySchema,
} from "../../../../utils/schemas/recipe";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
   try {
      const { searchParams } = new URL(req.url);
      const queryParams = RecipeQuerySchema.parse(
         Object.fromEntries(searchParams.entries())
      );
      const ingredientIds = queryParams.ingredients
         ? queryParams.ingredients.split(",").filter((id) => id.trim())
         : [];

      const ingredientFilter = ingredientIds.length > 0 ? {
         ingredients: {
            some: {
               ingredientId: {
                  in: ingredientIds,
               }
            }
         }
      } : {};
      
      const search = queryParams.search?.trim();
      const where = {
         ...(search ? {
            OR: [
               { name: { contains: search, mode: "insensitive" as const } },
               { description: { contains: search, mode: "insensitive" as const } },
            ]
         } : {}),
         ...ingredientFilter,
      }

      const sortBy = searchParams.get("sortBy");
      const sortOrder =
         (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

      let orderBy: any = undefined;

      if (sortBy) {
         orderBy = { [sortBy]: sortOrder };
      }

      let recipes = await prisma.recipe.findMany({
         where,
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
           cacheStrategy: { swr: 60, ttl: 60 },
         orderBy: orderBy
            ? orderBy
            : {
                 isFavorite: "desc",
              },
      });

      const totalRecipes = await prisma.recipe.count({ where });

      recipes = recipes.filter((recipe: typeof recipes[0]) => {
         const nutrition = calculateRecipeNutritionData(recipe);

         if (
            queryParams.minCalories !== undefined &&
            nutrition.calories < queryParams.minCalories
         ) {
            return false;
         }
         if (
            queryParams.maxCalories !== undefined &&
            nutrition.calories > queryParams.maxCalories
         ) {
            return false;
         }

         if (
            queryParams.minCarbs !== undefined &&
            nutrition.carbs < queryParams.minCarbs
         ) {
            return false;
         }
         if (
            queryParams.maxCarbs !== undefined &&
            nutrition.carbs > queryParams.maxCarbs
         ) {
            return false;
         }

         if (
            queryParams.minProtein !== undefined &&
            nutrition.protein < queryParams.minProtein
         ) {
            return false;
         }
         if (
            queryParams.maxProtein !== undefined &&
            nutrition.protein > queryParams.maxProtein
         ) {
            return false;
         }

         if (
            queryParams.minFat !== undefined &&
            nutrition.fat < queryParams.minFat
         ) {
            return false;
         }
         if (
            queryParams.maxFat !== undefined &&
            nutrition.fat > queryParams.maxFat
         ) {
            return false;
         }

         return true;
      });

      if (sortBy && ["calories", "carbs", "protein", "fat"].includes(sortBy)) {
         recipes.sort((a: typeof recipes[0], b: typeof recipes[0]) => {
            const nutritionA = calculateRecipeNutritionData(a);
            const nutritionB = calculateRecipeNutritionData(b);
            const valueA = nutritionA[sortBy as keyof typeof nutritionA];
            const valueB = nutritionB[sortBy as keyof typeof nutritionB];
            return sortOrder === "asc"
               ? Number(valueA) - Number(valueB)
               : Number(valueB) - Number(valueA);
         });
      } else if (sortBy) {
         recipes.sort((a: typeof recipes[0], b: typeof recipes[0]) => {
            const valueA = a[sortBy as keyof typeof a];
            const valueB = b[sortBy as keyof typeof b];

            // Handle null/undefined values
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return sortOrder === "asc" ? 1 : -1;
            if (valueB == null) return sortOrder === "asc" ? -1 : 1;

            // Compare values
            if (sortOrder === "asc") {
               return valueA > valueB ? 1 : -1;
            } else {
               return valueA < valueB ? 1 : -1;
            }
         });
      }
      return NextResponse.json({
         data: recipes,
         totalRecipes,
      });
   } catch (error) {
      console.error("Error fetching recipes:", error);
      return NextResponse.json(
         { error: "Failed to fetch recipes" },
         { status: 500 }
      );
   }
}

export async function POST(req: NextRequest) {
   try {
      const body = await req.json();
      const validatedData = CreateRecipeSchema.parse(body);
      const recipe = await prisma.recipe.create({
         data: {
            name: validatedData.name,
            description: validatedData.description,
            instructions: validatedData.instructions,
            servings: validatedData.servings,
            rating: validatedData.rating,
            isFavorite: validatedData.isFavorite,
            ingredients: {
               create: validatedData.ingredients.map((ingredient) => ({
                  ingredientId: ingredient.ingredientId,
                  quantityGrams: ingredient.quantityGrams,
               })),
            },
         },
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
      });
      return NextResponse.json(recipe);
   } catch (error) {
      if (error instanceof ZodError) {
         console.error("Invalid recipe data:", error.issues);
         return NextResponse.json(
            { error: "Invalid recipe data", details: error.issues },
            { status: 400 }
         );
      }
      console.error("Failed to create recipe:", error);
      return NextResponse.json(
         { error: "Failed to create recipe" },
         { status: 500 }
      );
   }
}

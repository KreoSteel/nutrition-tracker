import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma/prisma";
import { CreateRecipeSchema } from "../../../../utils/schemas/recipe";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
   try {
      const { searchParams } = new URL(req.url);
      const sortBy = searchParams.get("sortBy");
      const sortOrder =
         (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

      let orderBy: any = undefined;
      
      if (sortBy) {
         orderBy = { [sortBy]: sortOrder };
      }
      const recipes = await prisma.recipe.findMany({
         include: {
            ingredients: {
               include: {
                  ingredient: true,
               },
            },
         },
         orderBy: orderBy
            ? orderBy
            : {
                 isFavorite: "desc",
              },
      });
      return NextResponse.json(recipes);
   } catch (error) {
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
                  ingredient: true,
               },
            },
         },
      });
      return NextResponse.json(recipe);
   } catch (error) {
      if (error instanceof ZodError) {
         return NextResponse.json(
            { error: "Invalid recipe data", details: error.issues },
            { status: 400 }
         );
      }
      return NextResponse.json(
         { error: "Failed to create recipe" },
         { status: 500 }
      );
   }
}

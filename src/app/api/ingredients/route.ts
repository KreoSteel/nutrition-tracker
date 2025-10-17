import { prisma } from "../../../../utils/prisma/prisma";
import {
  CreateIngredientSchema,
  IngredientQuerySchema,
} from "../../../../utils/schemas";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = IngredientQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const search = queryParams.search?.trim();
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const ingredients = await (prisma as any).ingredient.findMany({
      where: {
        ...where,
        ...(queryParams.minCalories !== undefined ||
        queryParams.maxCalories !== undefined
          ? {
              caloriesPer100g: {
                ...(queryParams.minCalories !== undefined && {
                  gte: queryParams.minCalories,
                }),
                ...(queryParams.maxCalories !== undefined && {
                  lte: queryParams.maxCalories,
                }),
              },
            }
          : {}),
        ...(queryParams.minProtein !== undefined ||
        queryParams.maxProtein !== undefined
          ? {
              proteinPer100g: {
                ...(queryParams.minProtein !== undefined && {
                  gte: queryParams.minProtein,
                }),
                ...(queryParams.maxProtein !== undefined && {
                  lte: queryParams.maxProtein,
                }),
              },
            }
          : {}),
        ...(queryParams.minCarbs !== undefined ||
        queryParams.maxCarbs !== undefined
          ? {
              carbsPer100g: {
                ...(queryParams.minCarbs !== undefined && {
                  gte: queryParams.minCarbs,
                }),
                ...(queryParams.maxCarbs !== undefined && {
                  lte: queryParams.maxCarbs,
                }),
              },
            }
          : {}),
        ...(queryParams.minFat !== undefined || queryParams.maxFat !== undefined
          ? {
              fatPer100g: {
                ...(queryParams.minFat !== undefined && {
                  gte: queryParams.minFat,
                }),
                ...(queryParams.maxFat !== undefined && {
                  lte: queryParams.maxFat,
                }),
              },
            }
          : {}),
      },
      take: (queryParams.limit ?? 20) + 1,
      ...(queryParams.cursor && queryParams.cursor !== ""
        ? {
            cursor: {
              id: queryParams.cursor,
            },
            skip: 1,
          }
        : {}),
      orderBy:
        queryParams.sortBy && queryParams.sortOrder
          ? {
              [queryParams.sortBy]: queryParams.sortOrder,
            }
          : {
              [queryParams.sortBy ?? "name"]: queryParams.sortOrder ?? "asc",
            },
    });

    const totalIngredients = await (prisma as any).ingredient.count({where});
    const hasMore = ingredients.length > (queryParams.limit ?? 20);
    const data = hasMore ? ingredients.slice(0, queryParams.limit) : ingredients;
    const nextCursor =
      hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return NextResponse.json({
      data,
      nextCursor,
      hasMore,
      totalIngredients,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateIngredientSchema.parse(body);
    const ingredient = await (prisma as any).ingredient.create({
      data: {
        name: validatedData.name,
        caloriesPer100g: validatedData.caloriesPer100g,
        proteinPer100g: validatedData.proteinPer100g,
        carbsPer100g: validatedData.carbsPer100g,
        fatPer100g: validatedData.fatPer100g,
        category: validatedData.category,
        isCustom: true,
      },
    });
    return NextResponse.json(ingredient);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid ingredient data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}

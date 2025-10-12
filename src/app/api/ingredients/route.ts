import { prisma } from "../../../../utils/prisma/prisma";
import { CreateIngredientSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search");

    const validLimit = Math.min(Math.max(limit, 1), 100);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const ingredients = await prisma.ingredient.findMany({
      where,
      take: validLimit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),
      orderBy: {
        name: "asc",
      },
    });

    const hasMore = ingredients.length > validLimit
    const data = hasMore ? ingredients.slice(0, validLimit) : ingredients
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null

    return NextResponse.json({
      data,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = CreateIngredientSchema.parse(body);
    const ingredient = await prisma.ingredient.create({
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}
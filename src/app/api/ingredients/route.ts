import { prisma } from "../../../../utils/prisma/prisma";
import { CreateIngredientSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
    try {
        const ingredients = await prisma.ingredient.findMany()
        return NextResponse.json(ingredients)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validatedData = CreateIngredientSchema.parse(body)
        const ingredient = await prisma.ingredient.create({
            data: {
                name: validatedData.name,
                caloriesPer100g: validatedData.caloriesPer100g,
                proteinPer100g: validatedData.proteinPer100g,
                carbsPer100g: validatedData.carbsPer100g,
                fatPer100g: validatedData.fatPer100g,
                category: validatedData.category,
                isCustom: true,
            }
        })
        return NextResponse.json(ingredient)
        
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 })
    }
}
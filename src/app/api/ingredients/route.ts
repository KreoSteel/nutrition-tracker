import { prisma } from "../../../../utils/prisma/prisma";
import { NextResponse } from "next/server";

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
        const { name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, category } = await req.json()
        const ingredient = await prisma.ingredient.create({
            data: {
                name,
                caloriesPer100g,
                proteinPer100g,
                carbsPer100g,
                fatPer100g,
                category,
                isCustom: true,
            }
        })
        return NextResponse.json(ingredient)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 })
    }
}
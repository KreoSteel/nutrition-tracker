import { prisma } from "../../../../../utils/prisma/prisma";
import { NextResponse, NextRequest } from "next/server";
import { GetIngredientSchema, UpdateIngredientSchema } from "../../../../../utils/schemas";
import { ZodError } from "zod";

export async function GET({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = GetIngredientSchema.parse(await params);
        const ingredient = await prisma.ingredient.findUnique({
            where: { id }
        })
        if (!ingredient) {
            return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
        }
        return NextResponse.json(ingredient);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to fetch ingredient" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = GetIngredientSchema.parse(await params);
        const body = await req.json();
        const validatedData = UpdateIngredientSchema.parse(body);
        const ingredient = await prisma.ingredient.update({
            where: { id },
            data: validatedData
        })
        if (!ingredient) {
            return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
        }
        return NextResponse.json(ingredient);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{id: string}>}) {
    try {
        const { id } = GetIngredientSchema.parse(await params);
        const ingredient = await prisma.ingredient.delete({
            where: { id }
        })
        if (!ingredient) {
            return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
        }
        return NextResponse.json(ingredient);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to delete ingredient" }, { status: 500 });
    }
}
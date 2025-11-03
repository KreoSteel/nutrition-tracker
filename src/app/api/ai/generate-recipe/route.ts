import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateRecipeResponseSchema, GenerateRecipeSchema } from "../../../../../utils/schemas/recipe";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = GenerateRecipeSchema.parse(body);
        const { name, servings, ingredients } = validatedData;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing API key" }, { status: 500 });
        }
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return NextResponse.json({ error: "At least one ingredient is required. Please provide ingredients first." }, { status: 400 });
        }

        const ingredientsText = ingredients.map((ing) => `${ing.name} - ${ing.quantityGrams}g`).join(", ");
        const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = geminiAI.getGenerativeModel({ model: "gemini-2.5-flash"})

        const prompt = `You are a profesional chef assistant.
        You are given a list of ingredients and their quantity that is used for this recipe.
        You need to generate description and instructions for this recipe with following rules:
        - Description should be a brief description of the recipe with max of 1 sentence.
        - Instructions should be a step-by-step guide for cooking the recipe.
        - Return instructions as a JSON array of strings (each string is one step, no numbering).
        
        The numbers of steps are gonna be set already, you don't need to add them.
        Here is the information about the recipe:
        - Name of the recipe: ${name}
        - Servings ${servings}
        - Ingredients with their quantity in grams: ${ingredientsText}

        Generate the description and instructions for the recipe in the following JSON format:
        {
            "description": "...",
            "instructions": ["Step ...", "Step ...", "Step ..."]
        }
        Return only the JSON object, no other text or comments.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        })
        const resultText = result.response.text().trim();
        const match = resultText.match(/\{[\s\S]*?\}/);
        if (!match) {
            return NextResponse.json({ error: "Invalid response format. Please try again." }, { status: 400 });
        }


        const parsedRaw = JSON.parse(match[0]);
        const parsed = Array.isArray(parsedRaw.instructions)
            ? { ...parsedRaw, instructions: parsedRaw.instructions.join("\n") }
            : parsedRaw;
        if (typeof parsed.description !== "string" || typeof parsed.instructions !== "string") {
            return NextResponse.json({ error: "Invalid JSON format. Please try again." }, { status: 400 });
        }
        const validatedResponse = GenerateRecipeResponseSchema.parse(parsed);
        return NextResponse.json(validatedResponse);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: "Invalid data. Please check your input.", details: error.issues }, { status: 400 });
        }
        console.error("Failed to generate recipe:", error);
        return NextResponse.json({ error: "Failed to generate recipe. Please try again." }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const ping = url.searchParams.get("ping") ?? "ok";
    return NextResponse.json({
        status: "healthy",
        service: "ai/generate-recipe",
        hasApiKey: Boolean(process.env.GEMINI_API_KEY),
        ping,
    });
}
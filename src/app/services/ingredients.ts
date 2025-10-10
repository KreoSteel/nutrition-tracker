import { http } from "@/lib/http"
import { CreateIngredient, IngredientResponse, IngredientResponseSchema, IngredientResponseArraySchema } from "@/schemas"
import { ZodError } from "zod"

export const getIngredients = async (): Promise<IngredientResponse[]> => {
    try {
        const response = await http.get("/ingredients")
        return IngredientResponseArraySchema.parse(response.data)
    } catch (error) {
        console.error('Failed to fetch ingredients:', error)
        throw new Error('Failed to fetch ingredients')
    }
}


export const createIngredient = async (ingredient: CreateIngredient): Promise<IngredientResponse> => {
    try {
        const response = await http.post("/ingredients", ingredient)
        return IngredientResponseSchema.parse(response.data)
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message)
        }
        throw new Error("Failed to create ingredient")
    }   
}
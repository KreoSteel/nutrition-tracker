import { http } from "@/lib/http"
import { Ingredient } from "@prisma/client"

export const getIngredients = async (): Promise<Ingredient[]> => {
    const response = await http.get("/ingredients")
    return response.data as Ingredient[]
}

export const createIngredient = async (ingredient: Ingredient): Promise<Ingredient> => {
    const response = await http.post("/ingredients", ingredient)
    return response.data as Ingredient
}
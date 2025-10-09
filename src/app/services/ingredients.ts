import { http } from "@/lib/http"
import { Ingredient } from "@prisma/client"

export const getIngredients = async (): Promise<Ingredient[]> => {
    const response = await http.get("/ingredients")
    return response.data as Ingredient[]
}
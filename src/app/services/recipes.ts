import { http } from "@/lib/http";
import {
  CreateRecipe,
  CreateRecipeSchema,
  RecipeResponse,
  RecipeResponseSchema,
} from "../../../utils/schemas/recipe";
import { ZodError } from "zod";

export const getRecipes = async (): Promise<RecipeResponse> => {
  try {
    const response = await http.get("/recipes");
    return RecipeResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid recipe data: " + error.message);
    }
    throw new Error("Failed to fetch recipes");
  }
};

export const createRecipe = async (
  recipe: CreateRecipe
): Promise<RecipeResponse> => {
  try {
    const response = await http.post("/recipes", recipe);
    return RecipeResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid recipe data: " + error.message);
    }
    throw new Error("Failed to create recipe");
  }
};

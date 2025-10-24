import { http } from "@/lib/http";
import {
  CreateRecipe,
  UpdateRecipe,
  RecipeResponse,
  RecipeResponseSchema,
  RecipeQuery,
  RecipeQuerySchema,
} from "../../../utils/schemas/recipe";
import { ZodError } from "zod";

export const getRecipes = async (filters: Partial<RecipeQuery> = {}): Promise<{ data: RecipeResponse[]; totalRecipes: number }> => {
  try {
    const validatedParams = RecipeQuerySchema.partial().parse(filters);
    const queryParams = new URLSearchParams();

    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const response = await http.get(`/recipes?${queryParams.toString()}`);
    const responseData = response.data as { data: RecipeResponse[]; totalRecipes: number };
    return {
      data: RecipeResponseSchema.array().parse(responseData.data),
      totalRecipes: responseData.totalRecipes
    };
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

export const updateRecipe = async (
  id: string,
  recipe: UpdateRecipe
): Promise<RecipeResponse> => {
  try {
    const response = await http.patch(`/recipes/${id}`, recipe);
    return RecipeResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid recipe data: " + error.message);
    }
    throw new Error("Failed to update recipe");
  }
}
export const deleteRecipe = async (
  id: string
): Promise<void> => {
  try {
    await http.delete(`/recipes/${id}`);
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid recipe data: " + error.message);
    }
    throw new Error("Failed to delete recipe");
  }
}

export const toggleFavorite = async (
  id: string,
  isFavorite: boolean
): Promise<RecipeResponse> => {
  try {
    const response = await http.patch(`/recipes/${id}`, { isFavorite });
    return RecipeResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid recipe data: " + error.message);
    }
    throw new Error("Failed to toggle favorite");
  }
}
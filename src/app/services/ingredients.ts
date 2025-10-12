import { http } from "@/lib/http";
import {
  CreateIngredient,
  IngredientResponse,
  IngredientResponseSchema,
  PaginatedIngredientsResponse,
  PaginatedIngredientsResponseSchema,
  UpdateIngredient,
} from "@/schemas";
import { ZodError } from "zod";

interface GetIngredientsParams {
  cursor?: string | null;
  limit?: number;
  search?: string;
}

export const getIngredients = async (
  params: GetIngredientsParams = {}
): Promise<PaginatedIngredientsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.cursor) queryParams.append("cursor", params.cursor);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const response = await http.get(`/ingredients?${queryParams.toString()}`);
    return PaginatedIngredientsResponseSchema.parse(response.data);
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    throw new Error("Failed to fetch ingredients");
  }
};

export const createIngredient = async (
  ingredient: CreateIngredient
): Promise<IngredientResponse> => {
  try {
    const response = await http.post("/ingredients", ingredient);
    return IngredientResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error("Failed to create ingredient");
  }
};

export const getIngredient = async (
  id: string
): Promise<IngredientResponse> => {
  try {
    const response = await http.get(`/ingredients/${id}`);
    return IngredientResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error("Failed to fetch ingredient");
  }
};

export const updateIngredient = async (
  id: string,
  ingredient: UpdateIngredient
): Promise<IngredientResponse> => {
  try {
    const response = await http.patch(`ingredients/${id}`, ingredient);
    return IngredientResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error("Failed to update ingredient");
  }
};

export const deleteIngredient = async (
  id: string
): Promise<IngredientResponse> => {
  try {
    const response = await http.delete(`/ingredients/${id}`);
    return IngredientResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("Invalid ingredient data: " + error.message);
    }
    throw new Error("Failed to delete ingredient");
  }
};

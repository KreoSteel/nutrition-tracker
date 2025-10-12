import { z } from "zod";

export const IngredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name is required"),
  caloriesPer100g: z.coerce.number().min(0).max(10000, "Calories must be between 0-10000"),
  proteinPer100g: z.coerce.number().min(0).max(100, "Protein must be between 0-100g"),
  carbsPer100g: z.coerce.number().min(0).max(100, "Carbs must be between 0-100g"),
  fatPer100g: z.coerce.number().min(0).max(100, "Fat must be between 0-100g"),
  category: z.string().optional(),
});

export const CreateIngredientSchema = IngredientSchema

export const GetIngredientSchema = z.object({
  id: z.string(),
});

export const UpdateIngredientSchema = IngredientSchema.partial();

export const IngredientResponseSchema = IngredientSchema.extend({
  id: z.string().optional(),
  isCustom: z.boolean(),
  createdAt: z.string().transform((str) => new Date(str)),
});

export const IngredientResponseArraySchema = z.array(IngredientResponseSchema);

export const PaginatedIngredientsResponseSchema = z.object({
  data: z.array(IngredientResponseSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
export type CreateIngredient = z.infer<typeof CreateIngredientSchema>;
export type UpdateIngredient = z.infer<typeof UpdateIngredientSchema>;
export type IngredientResponse = z.infer<typeof IngredientResponseSchema>;
export type PaginatedIngredientsResponse = z.infer<typeof PaginatedIngredientsResponseSchema>;

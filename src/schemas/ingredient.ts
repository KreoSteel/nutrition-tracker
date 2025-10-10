import { z } from "zod";

export const IngredientSchema = z.object({
  name: z.string().min(3, "Name is required"),
  caloriesPer100g: z.coerce.number().min(0).max(900, "Calories must be between 0-900"),
  proteinPer100g: z.coerce.number().min(0).max(80, "Protein must be between 0-80g"),
  carbsPer100g: z.coerce.number().min(0, "Carbs cannot be negative"),
  fatPer100g: z.coerce.number().min(0, "Fat cannot be negative"),
  category: z.string().optional(),
});

export const CreateIngredientSchema = IngredientSchema

export const UpdateIngredientSchema = IngredientSchema.partial();

export const IngredientResponseSchema = IngredientSchema.extend({
  id: z.string(),
  isCustom: z.boolean(),
  createdAt: z.date(),
});

export const IngredientResponseArraySchema = z.array(IngredientResponseSchema);


export type Ingredient = z.infer<typeof IngredientSchema>;
export type CreateIngredient = z.infer<typeof CreateIngredientSchema>;
export type UpdateIngredient = z.infer<typeof UpdateIngredientSchema>;
export type IngredientResponse = z.infer<typeof IngredientResponseSchema>;

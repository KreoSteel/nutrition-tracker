import { z } from "zod";

export const RecipeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  servings: z.coerce.number().int().min(1, "Servings must be at least 1"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  cookingTime: z.string().optional(),
  rating: z.coerce
    .number()
    .int()
    .min(1)
    .max(100, "Rating must be between 1-100")
    .optional(),
  isFavorite: z.boolean().optional(),
});

export const RecipeIngredientInputSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantityGrams: z.coerce
    .number()
    .positive("Quantity must be positive")
    .max(1000, "Quantity must be less than 1000g"),
});

export const CreateRecipeSchema = RecipeSchema.extend({
  ingredients: z
    .array(RecipeIngredientInputSchema)
    .min(1, "Recipe must have at least one ingredient"),
});

export const UpdateRecipeSchema = RecipeSchema.partial().extend({
  ingredients: z.array(RecipeIngredientInputSchema).optional(),
});

export const RecipeIngredientResponseSchema = z.object({
  id: z.string(),
  ingredientId: z.string(),
  quantityGrams: z.number(),
  ingredient: z.object({
    id: z.string(),
    name: z.string(),
    caloriesPer100g: z.number(),
    proteinPer100g: z.number(),
    carbsPer100g: z.number(),
    fatPer100g: z.number(),
    category: z.string().nullable(),
  }),
});

export const RecipeResponseSchema = RecipeSchema.extend({
  id: z.string(),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
  ingredients: z.array(RecipeIngredientResponseSchema).optional(),
});

export const RecipeQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  minRating: z.coerce.number().min(1).max(100).optional(),
  maxRating: z.coerce.number().min(1).max(100).optional(),
  isFavorite: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["name", "rating", "createdAt", "updatedAt", "servings"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});


export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;
export type CreateRecipe = z.infer<typeof CreateRecipeSchema>;
export type RecipeQuery = z.infer<typeof RecipeQuerySchema>;
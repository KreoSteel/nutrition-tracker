export interface NutritionalData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityGrams: number;
  nutritionalData: NutritionalData;
}

export function calculateIngredientNutrition(
  nutritionalDataPer100g: NutritionalData,
  quantityGrams: number
): NutritionalData {
  return {
    calories:
      Math.round(
        ((nutritionalDataPer100g.calories * quantityGrams) / 100) * 10
      ) / 10,
    protein:
      Math.round(
        ((nutritionalDataPer100g.protein * quantityGrams) / 100) * 10
      ) / 10,
    carbs:
      Math.round(((nutritionalDataPer100g.carbs * quantityGrams) / 100) * 10) /
      10,
    fat:
      Math.round(((nutritionalDataPer100g.fat * quantityGrams) / 100) * 10) /
      10,
  };
}

export function calculateRecipeNutrition(
  recipeIngredients: RecipeIngredient[]
): NutritionalData {
  return recipeIngredients.reduce((total, ingredient) => {
    const calcNutrition = calculateIngredientNutrition(
      ingredient.nutritionalData,
      ingredient.quantityGrams
    );

    return {
      calories: total.calories + calcNutrition.calories,
      protein: total.protein + calcNutrition.protein,
      carbs: total.carbs + calcNutrition.carbs,
      fat: total.fat + calcNutrition.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}


export function calculateNutritionPerServing(totalNutrition: NutritionalData, servings: number): NutritionalData {
    return {
        calories: Math.round((totalNutrition.calories / servings) * 10) / 10,
        protein: Math.round((totalNutrition.protein / servings) * 10) / 10,
        carbs: Math.round((totalNutrition.carbs / servings) * 10) / 10,
        fat: Math.round((totalNutrition.fat / servings) * 10) / 10,
    }
}

// Helper function to calculate nutrition from RecipeResponse
export function calculateRecipeNutritionData(recipe: any): NutritionalData {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const recipeIngredients: RecipeIngredient[] = recipe.ingredients.map(
        (ingredient: any) => ({
            ingredientId: ingredient.ingredientId,
            quantityGrams: Number(ingredient.quantityGrams),
            nutritionalData: {
                calories: Number(ingredient.ingredient.caloriesPer100g),
                protein: Number(ingredient.ingredient.proteinPer100g),
                carbs: Number(ingredient.ingredient.carbsPer100g),
                fat: Number(ingredient.ingredient.fatPer100g),
            },
        })
    );

    return calculateRecipeNutrition(recipeIngredients);
}
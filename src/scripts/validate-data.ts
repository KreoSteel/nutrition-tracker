import { prisma } from "../../utils/prisma/prisma";

interface ValidationResult {
  totalIngredients: number;
  validIngredients: number;
  invalidIngredients: number;
  issues: string[];
  categoryBreakdown: Record<string, number>;
}

async function validateData(): Promise<ValidationResult> {
  try {
    console.log("Starting data validation...");

    // Fetch all ingredients from database
    const ingredients = await prisma.ingredient.findMany();

    const result: ValidationResult = {
      totalIngredients: ingredients.length,
      validIngredients: 0,
      invalidIngredients: 0,
      issues: [],
      categoryBreakdown: {},
    };

    // Validate each ingredient
    for (const ingredient of ingredients) {
      let isValid = true;
      const ingredientIssues: string[] = [];

      // Check for missing nutritional data
      if (
        ingredient.caloriesPer100g == null ||
        Number(ingredient.caloriesPer100g) <= 0
      ) {
        ingredientIssues.push("Missing or invalid calories");
        isValid = false;
      }

      if (
        ingredient.proteinPer100g == null ||
        Number(ingredient.proteinPer100g) < 0
      ) {
        ingredientIssues.push("Missing or invalid protein");
        isValid = false;
      }

      if (
        ingredient.carbsPer100g == null ||
        Number(ingredient.carbsPer100g) < 0
      ) {
        ingredientIssues.push("Missing or invalid carbs");
        isValid = false;
      }

      if (ingredient.fatPer100g == null || Number(ingredient.fatPer100g) < 0) {
        ingredientIssues.push("Missing or invalid fat");
        isValid = false;
      }

      // Check for suspiciously high values
      if (Number(ingredient.caloriesPer100g) > 900) {
        ingredientIssues.push("Suspiciously high calories (>900 per 100g)");
        isValid = false;
      }

      if (Number(ingredient.proteinPer100g) > 80) {
        ingredientIssues.push("Suspiciously high protein (>80g per 100g)");
        isValid = false;
      }

      // Check for missing category
      if (!ingredient.category || ingredient.category.trim() === "") {
        ingredientIssues.push("Missing category");
        isValid = false;
      }

      // Check for empty name
      if (!ingredient.name || ingredient.name.trim() === "") {
        ingredientIssues.push("Missing name");
        isValid = false;
      }

      // Count valid/invalid
      if (isValid) {
        result.validIngredients++;
      } else {
        result.invalidIngredients++;
        result.issues.push(
          `${ingredient.name}: ${ingredientIssues.join(", ")}`
        );
      }

      // Count categories
      const category = ingredient.category || "Unknown";
      result.categoryBreakdown[category] =
        (result.categoryBreakdown[category] || 0) + 1;
    }

    return result;
  } catch (error) {
    console.error("Error during validation:", error);
    throw error;
  }
}

async function printValidationReport(result: ValidationResult) {
  console.log("\n" + "=".repeat(50));
  console.log("📊 DATA VALIDATION REPORT");
  console.log("=".repeat(50));

  console.log(`\n📈 Summary:`);
  console.log(`  Total ingredients: ${result.totalIngredients}`);
  console.log(`  ✅ Valid ingredients: ${result.validIngredients}`);
  console.log(`  ❌ Invalid ingredients: ${result.invalidIngredients}`);
  console.log(
    `  Success rate: ${(
      (result.validIngredients / result.totalIngredients) *
      100
    ).toFixed(1)}%`
  );

  console.log(`\n📂 Categories:`);
  for (const [category, count] of Object.entries(result.categoryBreakdown)) {
    console.log(`  ${category}: ${count} items`);
  }

  if (result.issues.length > 0) {
    console.log(`\n⚠️  Issues found:`);
    result.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  } else {
    console.log(`\n🎉 All ingredients passed validation!`);
  }

  console.log("\n" + "=".repeat(50));
}

async function main() {
  try {
    const result = await validateData();
    await printValidationReport(result);
  } catch (error) {
    console.error("Validation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
main();

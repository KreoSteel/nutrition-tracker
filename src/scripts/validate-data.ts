import { prisma } from "../../utils/prisma/prisma";
import fs from "fs";
import path from "path";

interface ValidationResult {
  totalIngredients: number;
  validIngredients: number;
  invalidIngredients: number;
  issues: string[];
  warnings: string[];
  categoryBreakdown: Record<string, number>;
  nutritionalStats: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    minCalories: number;
    maxCalories: number;
  };
  duplicates: string[];
  suspiciousValues: string[];
}

async function validateData(): Promise<ValidationResult> {
  try {
    console.log("Starting comprehensive data validation...");

    // Fetch all ingredients from database
    const ingredients = await prisma.ingredient.findMany();

    const result: ValidationResult = {
      totalIngredients: ingredients.length,
      validIngredients: 0,
      invalidIngredients: 0,
      issues: [],
      warnings: [],
      categoryBreakdown: {},
      nutritionalStats: {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        minCalories: Infinity,
        maxCalories: 0,
      },
      duplicates: [],
      suspiciousValues: [],
    };

    // Track nutritional totals for averages
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let validCount = 0;

    // Track names for duplicate detection
    const nameCounts: Record<string, number> = {};

    // Validate each ingredient
    for (const ingredient of ingredients) {
      let isValid = true;
      const ingredientIssues: string[] = [];
      const ingredientWarnings: string[] = [];

      // Track name for duplicate detection
      const normalizedName = ingredient.name?.toLowerCase().trim() || "";
      nameCounts[normalizedName] = (nameCounts[normalizedName] || 0) + 1;

      // Check for empty name
      if (!ingredient.name || ingredient.name.trim() === "") {
        ingredientIssues.push("Missing name");
        isValid = false;
      }

      // Check for missing category
      if (!ingredient.category || ingredient.category.trim() === "") {
        ingredientIssues.push("Missing category");
        isValid = false;
      }

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

      // Check for suspiciously high values (errors)
      const calories = Number(ingredient.caloriesPer100g);
      const protein = Number(ingredient.proteinPer100g);
      const carbs = Number(ingredient.carbsPer100g);
      const fat = Number(ingredient.fatPer100g);

      if (calories > 900) {
        ingredientIssues.push("Suspiciously high calories (>900 per 100g)");
        isValid = false;
      }

      if (protein > 80) {
        ingredientIssues.push("Suspiciously high protein (>80g per 100g)");
        isValid = false;
      }

      if (carbs > 100) {
        ingredientIssues.push("Suspiciously high carbs (>100g per 100g)");
        isValid = false;
      }

      if (fat > 100) {
        ingredientIssues.push("Suspiciously high fat (>100g per 100g)");
        isValid = false;
      }

      // Check for suspiciously low values (warnings)
      if (calories < 5 && ingredient.category !== "Spices") {
        ingredientWarnings.push("Very low calories (<5 per 100g)");
      }

      if (protein === 0 && ingredient.category === "Meat") {
        ingredientWarnings.push("Zero protein in meat product");
      }

      if (fat === 0 && ingredient.category === "Fats & Oils") {
        ingredientWarnings.push("Zero fat in fat/oil product");
      }

      // Check for unrealistic nutritional ratios
      const totalMacros = protein * 4 + carbs * 4 + fat * 9;
      if (Math.abs(totalMacros - calories) > 50 && calories > 50) {
        ingredientWarnings.push(`Macro calories (${totalMacros.toFixed(1)}) don't match total calories (${calories})`);
      }

      // Count valid/invalid
      if (isValid) {
        result.validIngredients++;
        validCount++;
        
        // Add to nutritional totals for averages
        totalCalories += calories;
        totalProtein += protein;
        totalCarbs += carbs;
        totalFat += fat;
        
        // Track min/max calories
        result.nutritionalStats.minCalories = Math.min(result.nutritionalStats.minCalories, calories);
        result.nutritionalStats.maxCalories = Math.max(result.nutritionalStats.maxCalories, calories);
      } else {
        result.invalidIngredients++;
        result.issues.push(
          `${ingredient.name}: ${ingredientIssues.join(", ")}`
        );
      }

      // Add warnings
      if (ingredientWarnings.length > 0) {
        result.warnings.push(
          `${ingredient.name}: ${ingredientWarnings.join(", ")}`
        );
      }

      // Count categories
      const category = ingredient.category || "Unknown";
      result.categoryBreakdown[category] =
        (result.categoryBreakdown[category] || 0) + 1;
    }

    // Calculate averages
    if (validCount > 0) {
      result.nutritionalStats.avgCalories = totalCalories / validCount;
      result.nutritionalStats.avgProtein = totalProtein / validCount;
      result.nutritionalStats.avgCarbs = totalCarbs / validCount;
      result.nutritionalStats.avgFat = totalFat / validCount;
    }

    // Find duplicates
    for (const [name, count] of Object.entries(nameCounts)) {
      if (count > 1) {
        result.duplicates.push(`${name} (${count} occurrences)`);
      }
    }

    return result;
  } catch (error) {
    console.error("Error during validation:", error);
    throw error;
  }
}

async function printValidationReport(result: ValidationResult) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 COMPREHENSIVE DATA VALIDATION REPORT");
  console.log("=".repeat(60));

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

  console.log(`\n📊 Nutritional Statistics:`);
  console.log(`  Average calories per 100g: ${result.nutritionalStats.avgCalories.toFixed(1)}`);
  console.log(`  Average protein per 100g: ${result.nutritionalStats.avgProtein.toFixed(1)}g`);
  console.log(`  Average carbs per 100g: ${result.nutritionalStats.avgCarbs.toFixed(1)}g`);
  console.log(`  Average fat per 100g: ${result.nutritionalStats.avgFat.toFixed(1)}g`);
  console.log(`  Calorie range: ${result.nutritionalStats.minCalories.toFixed(1)} - ${result.nutritionalStats.maxCalories.toFixed(1)}`);

  console.log(`\n📂 Categories:`);
  const sortedCategories = Object.entries(result.categoryBreakdown)
    .sort(([,a], [,b]) => b - a);
  for (const [category, count] of sortedCategories) {
    const percentage = ((count / result.totalIngredients) * 100).toFixed(1);
    console.log(`  ${category}: ${count} items (${percentage}%)`);
  }

  if (result.duplicates.length > 0) {
    console.log(`\n🔄 Duplicate ingredients found:`);
    result.duplicates.forEach((duplicate, index) => {
      console.log(`  ${index + 1}. ${duplicate}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.slice(0, 10).forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
    if (result.warnings.length > 10) {
      console.log(`  ... and ${result.warnings.length - 10} more warnings`);
    }
  }

  if (result.issues.length > 0) {
    console.log(`\n❌ Critical Issues (${result.issues.length}):`);
    result.issues.slice(0, 10).forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
    if (result.issues.length > 10) {
      console.log(`  ... and ${result.issues.length - 10} more issues`);
    }
  } else {
    console.log(`\n🎉 All ingredients passed validation!`);
  }

  console.log("\n" + "=".repeat(60));
}

async function validateJsonFile(): Promise<void> {
  try {
    console.log("Validating ingredients.json file...");
    
    const jsonPath = path.join(__dirname, "data", "ingredients.json");
    
    if (!fs.existsSync(jsonPath)) {
      console.log("❌ ingredients.json file not found");
      return;
    }

    const jsonContent = fs.readFileSync(jsonPath, "utf-8");
    const ingredients = JSON.parse(jsonContent);

    console.log(`📄 JSON file validation:`);
    console.log(`  File size: ${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB`);
    console.log(`  Ingredients count: ${ingredients.length}`);
    console.log(`  Valid JSON format: ✅`);

    // Quick validation of JSON structure
    let validJsonItems = 0;
    const jsonCategories = new Set<string>();
    
    for (const ingredient of ingredients) {
      if (ingredient.name && ingredient.category && 
          typeof ingredient.calories === 'number' &&
          typeof ingredient.protein === 'number' &&
          typeof ingredient.carbs === 'number' &&
          typeof ingredient.fat === 'number') {
        validJsonItems++;
        jsonCategories.add(ingredient.category);
      }
    }

    console.log(`  Valid JSON items: ${validJsonItems}/${ingredients.length}`);
    console.log(`  Categories in JSON: ${jsonCategories.size}`);
    console.log(`  JSON validation: ${validJsonItems === ingredients.length ? '✅' : '❌'}`);

  } catch (error) {
    console.log(`❌ JSON file validation failed: ${error}`);
  }
}

async function main() {
  try {
    console.log("🔍 Starting comprehensive validation process...\n");
    
    // Validate JSON file first
    await validateJsonFile();
    
    console.log("\n" + "-".repeat(60) + "\n");
    
    // Validate database
    const result = await validateData();
    await printValidationReport(result);
    
    // Generate validation summary
    console.log("\n📋 VALIDATION SUMMARY:");
    console.log(`  Database ingredients: ${result.totalIngredients}`);
    console.log(`  Valid ingredients: ${result.validIngredients}`);
    console.log(`  Success rate: ${((result.validIngredients / result.totalIngredients) * 100).toFixed(1)}%`);
    console.log(`  Categories: ${Object.keys(result.categoryBreakdown).length}`);
    console.log(`  Warnings: ${result.warnings.length}`);
    console.log(`  Critical issues: ${result.issues.length}`);
    console.log(`  Duplicates: ${result.duplicates.length}`);
    
  } catch (error) {
    console.error("Validation failed:", error);
  }
}

// Run the validation
main();

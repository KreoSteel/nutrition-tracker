import { useState } from "react";
import { SortableHeader } from "../layout/SortableHeader";
import RecipeUpdateForm from "@/app/forms/RecipeUpdateForm";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "../ui/table";
import {
   calculateRecipeNutrition,
   RecipeIngredient,
} from "../../../utils/calculations/nutrition";
import { RecipeResponse } from "../../../utils/schemas/recipe";
import { useRecipes, useToggleFavorite } from "@/app/hooks/useRecipes";
import { Loader2, Pencil, Star } from "lucide-react";
import { Button } from "../ui/button";
type SortableField =
   | "name"
   | "servings"
   | "calories"
   | "carbs"
   | "protein"
   | "fat"
   | "rating"
   | "isFavorite";

export default function RecipesTables() {
   const { data: recipes, isLoading, isError } = useRecipes();
   const { mutate: toggleFavorite } = useToggleFavorite();
   const [sortState, setSortState] = useState<
      | {
           field: SortableField;
           order: "asc" | "desc";
        }
      | undefined
   >(undefined);
   const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

   const handleSort = (field: SortableField) => {
      setSortState((prev) => {
         if (!prev || prev.field !== field) {
            return { field, order: "asc" };
         } else if (prev.order === "asc") {
            return { field, order: "desc" };
         } else {
            return { field, order: "asc" };
         }
      });
   };

   const handleToggleFavorite = (id: string, currentFavorite: boolean) => {
      toggleFavorite({ id, isFavorite: !currentFavorite });
   };

   const calculateRecipeNutritionData = (recipe: RecipeResponse) => {
      if (!recipe.ingredients || recipe.ingredients.length === 0)
         return { calories: 0, protein: 0, carbs: 0, fat: 0 };

      const recipeIngredients: RecipeIngredient[] = recipe.ingredients.map(
         (ingredient) => ({
            ingredientId: ingredient.ingredientId,
            quantityGrams: ingredient.quantityGrams,
            nutritionalData: {
               calories: ingredient.ingredient.caloriesPer100g,
               protein: ingredient.ingredient.proteinPer100g,
               carbs: ingredient.ingredient.carbsPer100g,
               fat: ingredient.ingredient.fatPer100g,
            },
         })
      );

      return calculateRecipeNutrition(recipeIngredients);
   };

   if (isLoading) {
      return (
         <div className="text-center py-8">
            <Loader2 className="w-10 h-10 animate-spin" />
         </div>
      );
   }

   if (isError) {
      return (
         <div className="text-center py-8 text-red-500">
            Error loading recipes
         </div>
      );
   }

   if (!recipes || recipes.length === 0) {
      return <div className="text-center py-8">No recipes found</div>;
   }

   return (
      <div className="border border-border rounded-lg overflow-hidden">
         <Table className="p-20">
            <TableHeader>
               <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 text-xl">
                  <SortableHeader
                     field="name"
                     sortState={sortState}
                     onSort={handleSort}>
                     Name
                  </SortableHeader>
                  <SortableHeader
                     field="calories"
                     sortState={sortState}
                     onSort={handleSort}>
                     Calories
                  </SortableHeader>
                  <SortableHeader
                     field="protein"
                     sortState={sortState}
                     onSort={handleSort}>
                     Protein
                  </SortableHeader>
                  <SortableHeader
                     field="carbs"
                     sortState={sortState}
                     onSort={handleSort}>
                     Carbs
                  </SortableHeader>
                  <SortableHeader
                     field="fat"
                     sortState={sortState}
                     onSort={handleSort}>
                     Fat
                  </SortableHeader>
                  <SortableHeader
                     field="rating"
                     sortState={sortState}
                     onSort={handleSort}>
                     Rating
                  </SortableHeader>
                  <TableHead className="font-semibold">Favorite</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {recipes.map((recipe: RecipeResponse) => {
                  const recipeNutritionData =
                     calculateRecipeNutritionData(recipe);
                  return (
                     <TableRow
                        key={recipe.id}
                        className="text-lg text-muted-foreground font-medium">
                        <TableCell className="text-foreground max-w-xl">
                           <div className="flex flex-col">
                              <span className="text-lg font-medium">
                                 {recipe.name}
                              </span>
                              {recipe.description && (
                                 <span className="text-sm text-muted-foreground">
                                    {recipe.description}
                                 </span>
                              )}
                           </div>
                        </TableCell>
                        <TableCell>
                           <span className="text-orange-600 dark:text-orange-400">
                              {Number(recipeNutritionData.calories).toFixed(2)}kcal
                           </span>
                        </TableCell>
                        <TableCell>
                           <span className="text-blue-600 dark:text-blue-400">
                              {Number(recipeNutritionData.protein).toFixed(2)}g
                           </span>
                        </TableCell>
                        <TableCell>
                           <span className="text-green-600 dark:text-green-400">
                              {Number(recipeNutritionData.carbs).toFixed(2)}g
                           </span>
                        </TableCell>
                        <TableCell>
                           <span className="text-red-600 dark:text-red-400">
                              {Number(recipeNutritionData.fat).toFixed(2)}g
                           </span>
                        </TableCell>
                        <TableCell>
                           {recipe.rating ? `${recipe.rating}/100` : "—"}
                        </TableCell>
                        <TableCell>
                           <Button
                              variant="none"
                              size="icon"
                              onClick={() =>
                                 handleToggleFavorite(
                                    recipe.id,
                                    recipe.isFavorite || false
                                 )
                              }
                              className="h-fit w-fit aspect-square hover:bg-accent/">
                              <Star
                                 className={`size-8 ${
                                    recipe.isFavorite
                                       ? "fill-current text-yellow-400"
                                       : "text-gray-300"
                                 }`}
                              />
                           </Button>
                        </TableCell>
                        <TableCell>
                           <RecipeUpdateForm
                              recipe={recipe}
                              isOpen={selectedRecipeId === recipe.id}
                              onOpenChange={(open) => {
                                 setSelectedRecipeId(open ? recipe.id : null);
                              }}
                           />
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}

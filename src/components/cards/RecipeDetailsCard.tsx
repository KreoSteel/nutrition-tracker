import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogTrigger,
} from "@/components/ui/dialog";
import { RecipeResponse } from "../../../utils/schemas";
import { Button } from "../ui/button";
import {
   ChefHat,
   Clock,
   Eye,
   InfoIcon,
   Star,
   Users,
   ChevronLeft,
   Edit,
} from "lucide-react";
import { Separator } from "../ui/separator";
import NutritionDisplay from "../recipes/NutritionDisplay";
import { calculateRecipeNutritionData } from "../../../utils/calculations/nutrition";
import RecipeUpdateForm from "@/app/forms/RecipeUpdateForm";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface RecipeDetailsCardProps {
    recipe: RecipeResponse;
}

export default function RecipeDetailsCard({ recipe }: RecipeDetailsCardProps) {
   const [isEditOpen, setIsEditOpen] = useState(false);
   const queryClient = useQueryClient();

   const handleEditSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setIsEditOpen(false);
   };

   return (
      <Dialog>
            <DialogTrigger asChild>
            <Button
               variant="ghost"
               size="icon"
               className="h-12 w-12 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
               <Eye className="w-5 h-5" />
            </Button>
         </DialogTrigger>
         <DialogContent className="max-w-4xl min-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle className="text-2xl">{recipe.name}</DialogTitle>
               {recipe.description && (
                  <DialogDescription className="text-base pt-2">
                    {recipe.description}
                </DialogDescription>
               )}
            </DialogHeader>
               <div className="flex items-center justify-center h-64 w-full rounded-lg bg-gradient-to-tl from-primary/90 via-orange-500/90 to-accent">
                  <ChefHat className="w-30 h-30 text-white dark:text-black opacity-70" />
               </div>
            <Separator></Separator>
            <div className="flex justify-between gap-2 items-center">
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <Users className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Servings:
                     </span>
                     <span className="font-semibold">{recipe.servings}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Cooking Time:
                     </span>
                     <span className="font-semibold">{recipe.cookingTime}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <Star className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Rating:
                     </span>
                     <span className="font-semibold">
                        {recipe.rating ?? 0}/100
                     </span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <ChefHat className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm text-muted-foreground">
                        Cooked:
                     </span>
                     <span className="font-semibold">0</span>
                  </div>
               </div>
            </div>
            <Separator></Separator>
            <div className="flex flex-col gap-6 ">
               <div className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5" />{" "}
                  <h2 className="text-xl font-semibold">
                     Nutrition Per Serving
                  </h2>
               </div>
               <NutritionDisplay
                  nutrition={calculateRecipeNutritionData(recipe)}
                  servings={recipe.servings}
                  showPerServing={true}
               />
            </div>
            <Separator></Separator>
            <div className="flex flex-col gap-2">
               <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <span>Total Recipe Nutrition:</span>{" "}
                  <span className="font-semibold">
                     {Number(
                        calculateRecipeNutritionData(recipe).calories
                     ).toFixed(1)}
                     kcal
                  </span>
                  |
                  <span className="font-semibold">
                     {Number(
                        calculateRecipeNutritionData(recipe).protein
                     ).toFixed(1)}
                     g
                  </span>
                  |
                  <span className="font-semibold">
                     {Number(
                        calculateRecipeNutritionData(recipe).carbs
                     ).toFixed(1)}
                     g
                  </span>
                  |
                  <span className="font-semibold">
                     {Number(calculateRecipeNutritionData(recipe).fat).toFixed(
                        1
                     )}
                     g
                  </span>
               </div>
            </div>
            <Separator></Separator>
            <div className="flex flex-col gap-4">
               <h2 className="text-xl font-semibold">Ingredients</h2>
               <div className="flex flex-col gap-3">
                  {recipe.ingredients?.map((ingredient) => {
                     const nutrition = calculateRecipeNutritionData({
                        ingredients: [ingredient],
                     });
                     return (
                        <div
                           key={ingredient.id}
                           className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                           <div className="flex flex-col gap-1">
                              <span className="font-semibold text-base">
                                 {ingredient.ingredient.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                 {Number(ingredient.quantityGrams).toFixed(0)}g
                                 • {Number(nutrition.calories).toFixed(0)}kcal •
                                 P: {Number(nutrition.protein).toFixed(1)}g • C:{" "}
                                 {Number(nutrition.carbs).toFixed(1)}g • F:{" "}
                                 {Number(nutrition.fat).toFixed(1)}g
                              </span>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
               <h2 className="text-xl font-semibold">Instructions</h2>
               <div className="flex flex-col gap-3">
                  {recipe.instructions ? (
                     recipe.instructions.split("\n").map(
                        (instruction, index) =>
                           instruction.trim() && (
                              <div key={index} className="flex gap-3">
                                 <span className="font-semibold text-primary min-w-[24px]">
                                    {index + 1}.
                                 </span>
                                 <span className="text-sm leading-relaxed">
                                    {instruction.trim()}
                                 </span>
                              </div>
                           )
                     )
                  ) : (
                     <p className="text-muted-foreground text-sm">
                        No instructions provided for this recipe.
                     </p>
                  )}
               </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-3">
               <Button className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />I Cooked This Today
               </Button>

               <div className="flex items-center gap-2">
                  <RecipeUpdateForm 
                     recipe={recipe} 
                     isOpen={isEditOpen} 
                     onOpenChange={setIsEditOpen}
                     onSuccessDetailsCard={handleEditSuccess}
                  >
                     <Button variant="outline" className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Recipe
                     </Button>
                  </RecipeUpdateForm>
               </div>
            </div>
            </DialogContent>
        </Dialog>
   );
}

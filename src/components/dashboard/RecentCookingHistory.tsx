import {
   Utensils,
   Clock,
   Star,
   Calendar,
   ChefHat,
   Loader2,
   ArrowRightIcon,
   Eye,
} from "lucide-react";
import Link from "next/link";
import RecipeDetailsCard from "@/components/cards/RecipeDetailsCard";
import { Card, CardContent } from "@/components/ui/card";
import { useRecentCookingHistory } from "@/app/hooks/useCookingHistory";
import { Button } from "../ui/button";

export default function CookingHistory() {
   const {
      data: recentCookingHistory,
      isLoading,
      isError,
   } = useRecentCookingHistory();

   return (
      <section className="w-full flex flex-col bg-muted/30 py-8 px-8 border border-border/50  rounded-xl shadow-md">
         <div className="flex w-full pb-6 justify-between items-center">
            <h2 className="text-3xl font-semibold">Recent Cooking History</h2>
            <Link
               href="/cooking-history"
               className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80 transition-colors">
               View All <ArrowRightIcon size={16} />
            </Link>
         </div>

         {isLoading && (
            <div className="flex flex-col items-center gap-4 py-20">
               <Loader2 className="w-12 h-12 animate-spin text-primary" />
               <p className="text-base text-muted-foreground">
                  Loading cooking history...
               </p>
            </div>
         )}
         {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
               <p className="text-base text-red-500">
                  Error loading cooking history
               </p>
            </div>
         )}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCookingHistory?.map((history) => (
               <Card
                  key={history.id}
                  className="hover:shadow-md transition-shadow">
                  <CardContent className="px-4 py-2">
                     <div className="flex items-start justify-between ">
                        <div className="flex items-center gap-2">
                           <ChefHat className="h-5 w-5 text-orange-500" />
                           <h3 className="font-semibold text-lg leading-tight">
                              {history.recipe.name}
                           </h3>
                        </div>
                        <RecipeDetailsCard recipe={history.recipe}>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                              <Eye className="size-5" />
                           </Button>
                        </RecipeDetailsCard>
                     </div>

                     <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {history.recipe.description}
                     </p>

                     <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           <span>{history.recipe.cookingTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <Utensils className="h-3 w-3" />
                           <span>{history.recipe.servings} servings</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                           <Calendar className="h-3 w-3 text-muted-foreground" />
                           <span className="text-xs text-muted-foreground">
                              {history.cookedAt.toLocaleDateString("en-US", {
                                 month: "short",
                                 day: "numeric",
                                 hour: "2-digit",
                                 minute: "2-digit",
                              })}
                           </span>
                        </div>

                        <div className="flex items-center gap-2">
                           <Star className="h-3 w-3 fill-current text-yellow-500" />
                           <span className="text-xs font-medium">
                              {history.recipe.rating}/100
                           </span>
                           <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 font-semibold text-xs">
                              {history.recipe.timesCooked} times
                           </span>
                        </div>
                     </div>

                     <div className="mt-3 pt-3 border-t border-muted">
                        <div className="flex flex-wrap gap-1">
                           {history.recipe.ingredients
                              ?.slice(0, 3)
                              .map((recipeIngredient, index) => (
                                 <span
                                    key={index}
                                    className="text-xs bg-muted px-2 py-1 rounded-full">
                                    {recipeIngredient.ingredient.name}
                                 </span>
                              ))}
                           {history.recipe.ingredients?.length &&
                              history.recipe.ingredients.length > 3 && (
                                 <span className="text-xs text-muted-foreground px-2 py-1">
                                    +{history.recipe.ingredients.length - 3}{" "}
                                    more
                                 </span>
                              )}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
      </section>
   );
}

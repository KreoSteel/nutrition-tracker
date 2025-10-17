import { useFieldArray, useForm } from "react-hook-form";
import {
  CreateRecipe,
  CreateRecipeSchema,
} from "../../../utils/schemas/recipe";
import {
  calculateRecipeNutrition,
  calculateNutritionPerServing,
  RecipeIngredient,
} from "../../../utils/calculations/nutrition";
import NutritionDisplay from "@/components/recipes/NutritionDisplay";
import { useCreateRecipe } from "@/app/hooks/useRecipes";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useIngredients } from "../hooks/useIngredients";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDownIcon, PlusIcon, Trash2 } from "lucide-react";

export function RecipeCreateForm({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [openIngredientIndex, setOpenIngredientIndex] = useState<number | null>(null);
  const [searchIngredient, setSearchIngredient] = useState("");
  const { mutate: createRecipe } = useCreateRecipe();
  const {
    data: ingredientsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useIngredients({
    search: searchIngredient,
    limit: 50,
  });
  const filteredIngredients = ingredientsData?.pages.flatMap(
    (page) => page.data
  );
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateRecipeSchema),
    defaultValues: {
      name: "",
      description: "",
      rating: undefined,
      servings: 1,
      imageUrl: "",
      cookingTime: "",
      ingredients: [],
    },
  });

  const onSubmit = (data: CreateRecipe) => {
    createRecipe(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
        toast.success("Recipe created successfully");
        setIsOpen(false);
      },
      onError: () => {
        toast.error(`Failed to create recipe ${data.name}`);
        setIsOpen(false);
      },
    });
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const watchedIngredients = watch("ingredients");
  const watchedServings = watch("servings") as number;

  const calculateCurrentNutrition = () => {
    if (watchedIngredients.length === 0 || !ingredientsData) return null;

    const ingredientsWithNutrition = watchedIngredients
      .filter(
        (ingredient) => ingredient.ingredientId && ingredient.quantityGrams
      )
      .map((ingredient) => {
        const ingredientData = ingredientsData?.pages
          .flatMap((page) => page.data)
          .find((ing) => ing.id === ingredient.ingredientId);

        if (!ingredientData) {
          return null;
        }

        return {
          ingredientId: ingredient.ingredientId,
          quantityGrams: ingredient.quantityGrams,
          nutritionalData: {
            calories: ingredientData.caloriesPer100g,
            protein: ingredientData.proteinPer100g,
            carbs: ingredientData.carbsPer100g,
            fat: ingredientData.fatPer100g,
          },
        };
      })
      .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null);

    if (ingredientsWithNutrition.length === 0) return null;

    return calculateRecipeNutrition(ingredientsWithNutrition);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a new recipe</DialogTitle>
          <DialogDescription>
            Create a new recipe to your database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Recipe Name *
                </Label>
                <Input
                  type="text"
                  id="name"
                  {...register("name")}
                  placeholder="Enter recipe name"
                  className="w-full"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings" className="text-sm font-medium">
                  Servings *
                </Label>
                <Input
                  type="number"
                  id="servings"
                  {...register("servings")}
                  placeholder="Number of servings"
                  className="w-full"
                />
                {errors.servings && (
                  <p className="text-sm text-red-500">
                    {errors.servings.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                rows={3}
                id="description"
                {...register("description")}
                placeholder="Brief description of the recipe"
                className="w-full"
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Recipe Details Section */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">Recipe Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cookingTime" className="text-sm font-medium">
                  Cooking Time
                </Label>
                <Input
                  type="text"
                  id="cookingTime"
                  {...register("cookingTime")}
                  placeholder="e.g., 30 minutes"
                  className="w-full"
                />
                {errors.cookingTime && (
                  <p className="text-sm text-red-500">
                    {errors.cookingTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm font-medium">
                  Rating
                </Label>
                <Input
                  type="number"
                  id="rating"
                  {...register("rating")}
                  placeholder="1-100"
                  min="1"
                  max="100"
                  className="w-full"
                />
                {errors.rating && (
                  <p className="text-sm text-red-500">
                    {errors.rating.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                type="url"
                id="imageUrl"
                {...register("imageUrl")}
                placeholder="https://example.com/recipe-image.jpg"
                className="w-full"
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>
          </div>
          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ingredients</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ ingredientId: "", quantityGrams: 0 })
                  }
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Ingredient
                </Button>
              </div>
            </div>
            {errors.ingredients?.root?.message && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  {errors.ingredients.root.message}
                </p>
              </div>
            )}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 p-4 border rounded-lg bg-card shadow-sm ${
                    errors.ingredients?.[index] ? "border-red-200 bg-red-50/30" : ""
                  }`}
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor={`ingredients.${index}.ingredientId`}
                      className="text-sm font-medium text-foreground"
                    >
                      Ingredient №{index + 1}
                    </Label>
                    <Popover
                      open={openIngredientIndex === index}
                      onOpenChange={(open) => setOpenIngredientIndex(open ? index : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={openIngredientIndex === index}
                          className={`w-full justify-between truncate h-10 ${
                            errors.ingredients?.[index]?.ingredientId
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        >
                          <span className="truncate">
                            {watchedIngredients[index]?.ingredientId ? (
                              ingredientsData?.pages
                                .flatMap((page) => page.data)
                                .find(
                                  (ingredient) =>
                                    ingredient.id ===
                                    watchedIngredients[index]?.ingredientId
                                )?.name
                            ) : (
                              <span className="text-muted-foreground">
                                Select ingredient...
                              </span>
                            )}
                          </span>
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-0">
                        <div>
                          <div className="p-2 border-b">
                            <Input
                              type="text"
                              value={searchIngredient}
                              onChange={(e) =>
                                setSearchIngredient(e.target.value)
                              }
                              placeholder="Search ingredient by name or category"
                            />
                          </div>
                          <div className="max-h-70 overflow-y-auto">
                            {filteredIngredients?.map((ingredient) => (
                              <div
                                key={ingredient.id}
                                className="p-2 hover:bg-muted cursor-pointer"
                                onClick={() => {
                                  setValue(
                                    `ingredients.${index}.ingredientId`,
                                    ingredient.id ?? ""
                                  );
                                  setOpenIngredientIndex(null);
                                  setSearchIngredient("");
                                }}
                              >
                                <div className="flex flex-col gap-1.5">
                                  <span className="font-medium">
                                    {ingredient.name}
                                  </span>
                                  <div className="text-xs text-muted-foreground">
                                    {ingredient.caloriesPer100g} cal •{" "}
                                    {ingredient.proteinPer100g}g protein •{" "}
                                    {ingredient.carbsPer100g}g carbs •{" "}
                                    {ingredient.fatPer100g}g fat
                                    {ingredient.category && (
                                      <span> • {ingredient.category}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {hasNextPage && (
                            <div className="p-2 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="w-full"
                              >
                                {isFetchingNextPage
                                  ? "Loading..."
                                  : "Load More"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {errors.ingredients?.[index]?.ingredientId?.message && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.ingredients?.[index]?.ingredientId?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label
                      htmlFor={`ingredients.${index}.quantityGrams`}
                      className="text-sm font-medium text-foreground"
                    >
                      Quantity (g)
                    </Label>
                    <Input
                      type="number"
                      id={`ingredients.${index}.quantityGrams`}
                      {...register(`ingredients.${index}.quantityGrams`)}
                      placeholder="0"
                      min="0"
                      max="1000"
                      step="0.1"
                      className={`w-24 h-10 ${
                        errors.ingredients?.[index]?.quantityGrams
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {errors.ingredients?.[index]?.quantityGrams?.message && (
                      <p className="text-sm text-red-500">
                        {errors.ingredients?.[index]?.quantityGrams?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-10 w-10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {ingredientsData && watchedIngredients.length > 0 && calculateCurrentNutrition() && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold">
                  Nutritional Information
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Total Recipe</h4>
                  <NutritionDisplay nutrition={calculateCurrentNutrition()!} servings={watchedServings} showPerServing={false} />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Per Serving ({watchedServings} servings)
                  </h4>
                  <NutritionDisplay
                    nutrition={calculateCurrentNutrition()!}
                    servings={watchedServings}
                    showPerServing={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="flex justify-end pt-4 border-t gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="px-8">
              Create Recipe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

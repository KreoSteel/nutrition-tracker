import { useFieldArray, useForm } from "react-hook-form";
import {
  CreateRecipe,
  CreateRecipeSchema,
} from "../../../utils/schemas/recipe";
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
import { useAllIngredients } from "../hooks/useIngredients";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecipeCreateForm({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openIngredient, setOpenIngredient] = useState(false);
  const { mutate: createRecipe } = useCreateRecipe();
  const { data: allIngredients } = useAllIngredients();
  const queryClient = useQueryClient();
  const allIngredientsData = allIngredients?.data || [];

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
  const watchedServings = watch("servings");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new recipe</DialogTitle>
          <DialogDescription>
            Create a new recipe to your database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input
              type="text"
              id="name"
              {...register("name")}
              placeholder="Enter recipe name"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              rows={4}
              id="description"
              {...register("description")}
              placeholder="Brief description of the recipe"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              type="number"
              id="servings"
              {...register("servings")}
              placeholder="Enter number of servings"
            />
            {errors.servings && (
              <p className="text-red-500">{errors.servings.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cookingTime">Cooking Time</Label>
            <Input
              type="text"
              id="cookingTime"
              {...register("cookingTime")}
              placeholder="Enter cooking time"
            />
            {errors.cookingTime && (
              <p className="text-red-500">{errors.cookingTime.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              type="text"
              id="imageUrl"
              {...register("imageUrl")}
              placeholder="Enter recipe image URL"
            />
            {errors.imageUrl && (
              <p className="text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rating">Rating</Label>
            <Input
              type="number"
              id="rating"
              {...register("rating")}
              placeholder="Enter rating"
            />
            {errors.rating && (
              <p className="text-red-500">{errors.rating.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Create Recipe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

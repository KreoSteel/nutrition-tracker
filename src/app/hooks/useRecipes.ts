import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
   RecipeQuery,
   UpdateRecipe,
} from "../../../utils/schemas/recipe";
import {
   createRecipe,
   getRecipes,
   updateRecipe,
   deleteRecipe,
   toggleFavorite,
} from "@/app/services/recipes";
import { toast } from "sonner";

export const useRecipes = (filters: Partial<RecipeQuery> = {}) => {
   return useQuery({
      queryKey: ["recipes", filters],
      queryFn: () => getRecipes(filters),
      select: (data) => ({
         recipes: data.data,
         totalRecipes: data.totalRecipes
      }),
      staleTime: 60 * 1000, // Cache for 60 seconds
   });
};

export const useCreateRecipe = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["createRecipe"],
      mutationFn: createRecipe,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
      onError: () => {
         toast.error("Failed to create recipe");
      },
   });
};

export const useUpdateRecipe = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["updateRecipe"],
      mutationFn: ({ id, recipe }: { id: string; recipe: UpdateRecipe }) =>
         updateRecipe(id, recipe),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
      onError: () => {
         toast.error("Failed to update recipe");
      },
   });
};

export const useDeleteRecipe = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["deleteRecipe"],
      mutationFn: deleteRecipe,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
      onError: () => {
         toast.error("Failed to delete recipe");
      },
   });
};

export const useToggleFavorite = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationKey: ["toggleFavorite"],
      mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
         toggleFavorite(id, isFavorite),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
      onError: () => {
         toast.error("Failed to update favorite");
      },
   });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateRecipe, RecipeQuery } from "../../../utils/schemas/recipe";
import { createRecipe, getRecipes } from "@/app/services/recipes";
import { toast } from "sonner";

export const useRecipes = (filters: Partial<RecipeQuery> = {}) => {
    return useQuery({
        queryKey: ["recipes", filters],
        queryFn: getRecipes,
    })
}

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createRecipe"],
        mutationFn: createRecipe,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
        },
        onError: () => {
            toast.error("Failed to create recipe")
        }
    })
}
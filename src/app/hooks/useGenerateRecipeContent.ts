import { UseFormSetValue, UseFormWatch, FieldValues } from "react-hook-form";
import { useGenerateRecipeContent } from "./useRecipes";
import { useState } from "react";
import { toast } from "sonner";
import { GenerateRecipeResponse } from "../../../utils/schemas/recipe";

interface RecipeIngredient {
    ingredientId?: string;
    quantityGrams?: number | unknown;
}

interface RecipeFormData extends FieldValues {
    name?: string | unknown;
    servings?: number | unknown;
    ingredients?: RecipeIngredient[];
    description?: string | null;
    instructions?: string | null;
}

interface GenerateRecipeContentParams<T extends RecipeFormData> {
    watch: UseFormWatch<T>;
    setValue: UseFormSetValue<T>;
    resolveIngredientName: (id: string) => string;
}

export function useRecipeAIContent<T extends RecipeFormData>({
    watch,
    setValue,
    resolveIngredientName
}: GenerateRecipeContentParams<T>) {
    const { mutate: generateRecipeContent } = useGenerateRecipeContent()
    const [isPendingDesc, setIsPendingDesc] = useState(false)
    const [isPendingInstr, setIsPendingInstr] = useState(false)

    const onGenerate = (target: "description" | "instructions") => {
        const isPending = target === "description" ? setIsPendingDesc : setIsPendingInstr;
        isPending(true);

        // Type-safe access to form values
        const formValues = watch() as RecipeFormData;
        const watchedIngredients = formValues.ingredients;
        const name = formValues.name;
        const servings = formValues.servings;

        if (!watchedIngredients || !Array.isArray(watchedIngredients) || watchedIngredients.length === 0) {
            toast.error('Add ingredients first')
            isPending(false)
            return
        }

        const payload = {
            name: (typeof name === 'string' ? name : 'Recipe') || 'Recipe',
            servings: Number(servings || 1),
            ingredients: watchedIngredients
            .filter((ing): ing is RecipeIngredient & { ingredientId: string; quantityGrams: number | unknown } => 
                ing !== null && 
                ing !== undefined && 
                typeof ing === 'object' && 
                'ingredientId' in ing && 
                !!ing.ingredientId && 
                'quantityGrams' in ing && 
                !!ing.quantityGrams
            )
            .map((ing) => ({
                name: resolveIngredientName(ing.ingredientId),
                quantityGrams: Number(ing.quantityGrams),
            })),
        };

        generateRecipeContent(payload, {
            onSuccess: (result: GenerateRecipeResponse) => {
                const descriptionValue = result.description ?? "";
                const instructionsValue = result.instructions ?? "";
                if (target === "description") {
                    (setValue as unknown as UseFormSetValue<RecipeFormData>)('description', descriptionValue, {shouldDirty: true})
                } else {
                    (setValue as unknown as UseFormSetValue<RecipeFormData>)('instructions', instructionsValue, {shouldDirty: true})
                }
                toast.success(`${target} is generated successfully`)
            },
            onError: (error) => {
                toast.error(error instanceof Error ? error.message : `${target} generation failed`)
            },
            onSettled: () => {
                isPending(false)
            }
        })

    }

    return {
        onGenerate,
        isPendingDesc,
        isPendingInstr,
    }
}
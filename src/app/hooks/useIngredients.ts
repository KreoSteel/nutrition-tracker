"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getIngredients, createIngredient, updateIngredient } from "@/app/services/ingredients"
import { toast } from "sonner"
import { UpdateIngredient, IngredientQuery } from "../../../utils/schemas"


export const useIngredients = (filters: Partial<IngredientQuery> = {}) => {
    return useInfiniteQuery({
        queryKey: ["ingredients", filters],
        queryFn: ({ pageParam }) => getIngredients({
            cursor: pageParam as string | undefined,
            limit: 50,
            ...filters,
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor ?? undefined
        }
    })
}

export const useCreateIngredient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["createIngredient"],
        mutationFn: createIngredient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingredients"] })
        },
        onError: () => {
            toast.error("Failed to create ingredient")
        }
    })
}

export const useUpdateIngredient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["updateIngredient"],
        mutationFn: ({ id, ingredient }: { id: string, ingredient: UpdateIngredient}) => updateIngredient(id, ingredient),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingredients"] })
        },
        onError: () => {
            toast.error("Failed to update ingredient")
        }
    })
}
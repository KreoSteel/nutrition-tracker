"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getIngredients, createIngredient, updateIngredient } from "@/app/services/ingredients"
import { toast } from "sonner"
import { UpdateIngredient } from "@/schemas"


export const useIngredients = (search?: string) => {
    return useInfiniteQuery({
        queryKey: ["ingredients", search],
        queryFn: ({ pageParam }) => getIngredients({
            cursor: pageParam as string | null,
            limit: 50,
            search: search,
        }),
        initialPageParam: null as string | null,
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
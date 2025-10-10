"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getIngredients, createIngredient } from "@/app/services/ingredients"
import { toast } from "sonner"

export const useIngredients = () => {
    return useQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
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
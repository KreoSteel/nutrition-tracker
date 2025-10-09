"use client"

import { useQuery } from "@tanstack/react-query"
import { getIngredients } from "@/app/services/ingredients"

export const useIngredients = () => {
    return useQuery({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    })
}
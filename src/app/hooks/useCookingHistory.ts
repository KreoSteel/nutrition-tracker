import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getCookingHistory, createCookingHistory, deleteCookingHistory } from "../services/cookingHistory";
import { CookingHistoryQuery } from "../../../utils/schemas";
import { toast } from "sonner";

export const useCookingHistory = (filters: Partial<CookingHistoryQuery> = {}) => {
    return useInfiniteQuery({
        queryKey: ["cooking-history", filters],
        queryFn: ({ pageParam }) => getCookingHistory({
            cursor: pageParam as string | undefined,
            limit: 10,
            ...filters,
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor ?? undefined
        }
    })
}

export const useCreateCookingHistory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createCookingHistory"],
        mutationFn: createCookingHistory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cooking-history"] })
            toast.success("Cooking history created successfully")
        },
        onError: () => {
            toast.error("Failed to create cooking history")
        }
    })
}

export const useDeleteCookingHistory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteCookingHistory"],
        mutationFn: deleteCookingHistory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cooking-history"] })
            toast.success("Cooking history deleted successfully")
        },
        onError: () => {
            toast.error("Failed to delete cooking history")
        }
    })
}
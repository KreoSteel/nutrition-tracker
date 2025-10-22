import { http } from "@/lib/http";
import {
   CookingHistoryQuery,
   CookingHistoryQuerySchema,
   CookingHistoryResponseSchema,
   PaginatedCookingHistoryResponse,
   PaginatedCookingHistoryResponseSchema,
   CookingHistoryResponse,
   CreateCookingHistorySchema,
} from "../../../utils/schemas";
import { ZodError } from "zod";

export const getCookingHistory = async (
   params: Partial<CookingHistoryQuery> = {}
): Promise<PaginatedCookingHistoryResponse> => {
    try {
        const validatedParams = CookingHistoryQuerySchema.partial().parse(params);
        const queryParams = new URLSearchParams();

        Object.entries(validatedParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                queryParams.append(key, value.toString());
            }
        })
        const response = await http.get(`/cooking-history?${queryParams.toString()}`);
        return PaginatedCookingHistoryResponseSchema.parse(response.data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error("Invalid cooking history query: " + error.message);
        }
        throw new Error("Failed to fetch cooking history");
    }
};

export const createCookingHistory = async (cookingHistory: CreateCookingHistorySchema): Promise<CookingHistoryResponse> => {
    try {
        const response = await http.post("/cooking-history", cookingHistory)
        return CookingHistoryResponseSchema.parse(response.data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error("Invalid cooking history data: " + error.message);
        }
        throw new Error("Failed to create cooking history");
    }
};

export const deleteCookingHistory = async (id: string): Promise<void> => {
    try {
        await http.delete(`/cooking-history/${id}`);
        return;
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error("Invalid cooking history data: " + error.message);
        }
        throw new Error("Failed to delete cooking history");
    }
}
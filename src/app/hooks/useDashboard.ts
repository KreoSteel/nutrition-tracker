import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../services/dashboard";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardData(),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
  });
};


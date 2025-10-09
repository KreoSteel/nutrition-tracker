"use client"
import CookingHistory from "@/components/CookingHistory";
import HeroSection from "@/components/HeroSection";
import QuickActions from "@/components/QuickActions";
import RecentRecipes from "@/components/RecentRecipes";
import WeekNutrition from "@/components/WeekNutrition";
import { useIngredients } from "./hooks/useIngredients";

export default function Dashboard() {
  const { data: ingredients } = useIngredients()
  return (
    <div className="flex flex-col w-full gap-10 mt-10">
      <HeroSection />
      <QuickActions />
      <div className="grid grid-cols-2 gap-8 ">
        <RecentRecipes />
        <WeekNutrition />
        {ingredients?.length} Ingredients Found
      </div>
      <CookingHistory />
    </div>
  );
}

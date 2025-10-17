"use client"
import CookingHistory from "@/components/CookingHistory";
import HeroSection from "@/components/HeroSection";
import QuickActions from "@/components/QuickActions";
import RecentRecipes from "@/components/RecentRecipes";
import WeekNutrition from "@/components/WeekNutrition";

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full gap-10 mt-10">
      <HeroSection />
      <QuickActions />
      <div className="grid grid-cols-2 gap-8 ">
        <RecentRecipes />
        <WeekNutrition />
      </div>
      <CookingHistory />
    </div>
  );
}

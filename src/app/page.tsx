"use client"
import CookingHistory from "@/components/dashboard/CookingHistory";
import HeroSection from "@/components/dashboard/HeroSection";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentRecipes from "@/components/dashboard/RecentRecipes";
import WeekNutrition from "@/components/dashboard/WeekNutrition";

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

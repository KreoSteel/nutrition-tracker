"use client"
import CookingHistory from "@/components/dashboard/RecentCookingHistory";
import HeroSection from "@/components/dashboard/HeroSection";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentRecipes from "@/components/dashboard/RecentRecipes";
import WeekNutrition from "@/components/dashboard/WeekNutrition";

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full gap-10 mt-10">
      <HeroSection />
      <QuickActions />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="order-2 sm:order-1">
          <RecentRecipes />
        </div>
        <div className="order-1 sm:order-2">
          <WeekNutrition />
        </div>
      </div>
      <CookingHistory />
    </div>
  );
}

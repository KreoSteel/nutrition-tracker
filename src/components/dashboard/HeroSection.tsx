import { TrendingUp, Utensils, Flame } from "lucide-react";
import { useRecipes } from "@/app/hooks/useRecipes";
import { useCookingStats } from "@/app/hooks/useCookingHistory";

export default function HeroSection() {
  const { data: recipesData } = useRecipes()
  const totalRecipes = recipesData?.totalRecipes || 0

  const { data: cookingStats } = useCookingStats();
  const todayCooks = cookingStats?.todayCooks || 0
  const thisWeekCooks = cookingStats?.thisWeekCooks || 0

  return (
    <section className="w-full flex flex-col items-center justify-center bg-muted/30 py-16 px-8 rounded-xl shadow-sm">
      <div className="flex flex-col items-center justify-center gap-3">
        <h1 className="text-5xl font-semibold">Welcome to NutriTrack! 👋</h1>
        <p className="text-muted-foreground text-xl">
          Ready to cook something delicious?
        </p>
      </div>
      <div className="grid grid-cols-3 gap-12 w-[85%] mt-12">
        <div className="flex items-center gap-5 border-2 border-border/50 py-8 px-14 rounded-xl shadow-md hover:shadow-lg transition-all dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
          <div className="text-primary bg-primary/15 p-3.5 rounded-xl">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <p className="text-muted-foreground text-base">Today&apos;s Meals</p>
            <p className="text-foreground text-2xl font-semibold">{todayCooks}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 border-2 border-border/50 py-8 px-14 rounded-xl shadow-md hover:shadow-lg transition-all dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
          <div className="text-foreground bg-primary/15 p-3.5 rounded-xl">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-muted-foreground text-base">Total Recipes</p>
            <p className="text-foreground text-2xl font-semibold">{totalRecipes}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 border-2 border-border/50 py-8 px-14 rounded-xl shadow-md hover:shadow-lg transition-all dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
          <div className="text-primary bg-primary/15 p-3.5 rounded-xl">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <p className="text-muted-foreground text-base">This Week&apos;s Cooking</p>
            <p className="text-foreground text-2xl font-semibold">{thisWeekCooks}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

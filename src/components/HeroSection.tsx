import { TrendingUp, Utensils, Flame } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-1.5 mb-10">
        <h1 className="text-4xl">Welcome to NutriTrack! 👋</h1>
        <p className="text-muted-foreground text-lg">
          Ready to cook something delicious?
        </p>
      </div>
      <div className="grid grid-cols-3 gap-10 w-[80%] ">
        <div className="flex items-center gap-4 border-b border-border py-6 px-12 rounded-lg hover:shadow-md transition-all dark:shadow-muted-foreground/10">
          <div className="text-primary bg-primary/15 p-2 rounded-lg">
            <Utensils />
          </div>
          <div>
            <p className="text-muted-foreground ">Today's Meals</p>
            <p className="text-foreground text-xl font-medium">0</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-b border-border py-6 px-12 rounded-lg hover:shadow-md transition-all dark:shadow-muted-foreground/10">
          <div className="text-foreground bg-primary/15 p-2 rounded-lg">
            <TrendingUp />
          </div>
          <div>
          <p className="text-muted-foreground ">Total Recipes</p>
          <p className="text-foreground text-xl font-medium">0</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-b border-border py-6 px-12 rounded-lg hover:shadow-md transition-all dark:shadow-muted-foreground/10">
          <div className="text-primary bg-primary/15 p-2 rounded-lg">
            <Flame />
          </div>
          <div>
          <p className="text-muted-foreground ">This Week's Cooking</p>
          <p className="text-foreground text-xl font-medium">0</p>
          </div>
        </div>
      </div>
    </section>
  );
}

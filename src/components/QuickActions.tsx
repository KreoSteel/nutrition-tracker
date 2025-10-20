import { Plus, PackagePlus, CheckCircle } from "lucide-react";
import { IngredientCreateForm } from "@/app/forms/IngredientCreateForm";
import { RecipeCreateForm } from "@/app/forms/RecipeCreateForm";

export default function QuickActions() {
  return (
    <section className="w-full border border-gray-200/80 rounded-xl flex flex-col items-center justify-center shadow-md dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
      <span className="flex w-full px-8 pb-6 pt-8">
        <h2 className="text-3xl font-semibold">Quick Actions</h2>
      </span>
      <div className="flex justify-between w-full px-8 pb-8 pt-4 gap-6">
        <RecipeCreateForm>
          <button className="group text-left flex items-center gap-4 p-6 shadow-md bg-primary text-primary-foreground rounded-xl w-full cursor-pointer hover:bg-orange-600/90 transition-all dark:hover:bg-gray-300">
          <div className="bg-white/20 text-primary-foreground rounded-xl p-3 group-hover:scale-105 transition-all dark:bg-gray-200">
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex flex-col w-full">
            <p className="font-semibold text-lg">Create Recipe</p>
            <p className="text-sm font-light opacity-90">Build new dish</p>
          </div>
        </button>
        </RecipeCreateForm>
        <IngredientCreateForm>
          <button className="group flex items-center text-left gap-4 p-6 shadow-md bg-chart-2 text-primary-foreground rounded-xl w-full cursor-pointer hover:bg-green-950/90 transition-all dark:hover:bg-emerald-600">
            <div className="bg-white/20 text-primary-foreground rounded-xl p-3 group-hover:scale-105 transition-all">
              <PackagePlus className="w-6 h-6" />
            </div>
            <div className="flex flex-col w-full">
              <p className="font-semibold text-lg">Add Ingredients</p>
              <p className="text-sm font-light opacity-90">Add new ingredients</p>
            </div>
          </button>
        </IngredientCreateForm>
        <div className="group flex items-center gap-4 p-6 shadow-md bg-chart-3 text-primary-foreground rounded-xl w-full cursor-pointer hover:bg-[#E89251] transition-all dark:hover:bg-[#E89251]">
          <div className="bg-white/20 text-primary-foreground rounded-xl p-3 group-hover:scale-105 transition-all">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col w-full">
            <p className="font-semibold text-lg">Mark as Cooked</p>
            <p className="text-sm font-light opacity-90">Log your cooked meals</p>
          </div>
        </div>
      </div>
    </section>
  );
}

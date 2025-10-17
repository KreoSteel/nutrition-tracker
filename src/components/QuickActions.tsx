import { Plus, PackagePlus, CheckCircle } from "lucide-react";
import { IngredientCreateForm } from "@/app/forms/IngredientCreateForm";

export default function QuickActions() {
  return (
    <section className="w-full border border-gray-200/80 rounded-lg flex flex-col items-center justify-center shadow-md dark:shadow-muted-foreground/10">
      <span className="flex w-full px-6 pb-4 pt-6">
        <h2 className="text-2xl font-medium">Quick Actions</h2>
      </span>
      <div className="flex justify-between w-full px-6 pb-4 pt-6 gap-4">
        <div className="group flex items-center gap-2 p-4 shadow-md bg-primary text-primary-foreground rounded-lg w-full cursor-pointer hover:bg-orange-600/90 transition-all dark:hover:bg-gray-300">
          <div className="bg-white/20 text-primary-foreground rounded-lg p-2 group-hover:scale-105 transition-all dark:bg-gray-200">
            <Plus />
          </div>
          <div className="flex flex-col w-full">
            <p className="font-medium">Create Recipe</p>
            <p className="text-[13px] font-light">Build new dish</p>
          </div>
        </div>
        <IngredientCreateForm>
          <button className="group flex items-center text-left gap-2 p-4 shadow-md bg-chart-2 text-primary-foreground rounded-lg w-full cursor-pointer hover:bg-green-950/90 transition-all dark:hover:bg-emerald-600">
            <div className="bg-white/20 text-primary-foreground rounded-lg p-2 group-hover:scale-105 transition-all">
              <PackagePlus />
            </div>
            <div className="flex flex-col w-full">
              <p className="font-medium">Add Ingredients</p>
              <p className="text-[13px] font-light">Add new ingredients</p>
            </div>
          </button>
        </IngredientCreateForm>
        <div className="group flex items-center gap-2 p-4 shadow-md bg-chart-3 text-primary-foreground rounded-lg w-full cursor-pointer hover:bg-[#E89251] transition-all dark:hover:bg-[#E89251]">
          <div className="bg-white/20 text-primary-foreground rounded-lg p-2 group-hover:scale-105 transition-all">
            <CheckCircle />
          </div>
          <div className="flex flex-col w-full">
            <p className="font-medium">Mark as Cooked</p>
            <p className="text-[13px] font-light">Log your cooked meals</p>
          </div>
        </div>
      </div>
    </section>
  );
}

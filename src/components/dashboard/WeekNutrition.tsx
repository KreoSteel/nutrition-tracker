import { ChefHat, Loader2 } from "lucide-react";
import { useWeeklyNutrition } from "@/app/hooks/useCookingHistory";
import { Button } from "../ui/button";
import {
   PieChart,
   Pie,
   Tooltip,
   ResponsiveContainer,
   Cell,
} from "recharts";

export default function WeekNutrition() {
   const { data: weeklyNutrition, isLoading, isError, refetch } = useWeeklyNutrition();

   if (isLoading) {
      return (
         <section className="w-full border border-gray-200/80 rounded-xl flex flex-col shadow-md dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
            <span className="flex w-full px-8 pb-6 pt-8 justify-between items-center">
               <h2 className="text-3xl font-semibold">Week Nutrition</h2>
            </span>
            <div className="flex flex-col items-center gap-4 py-20">
               <Loader2 className="w-12 h-12 animate-spin text-primary" />
               <p className="text-base text-muted-foreground">
                  Loading weekly nutrition data...
               </p>
            </div>
         </section>
      );
   }

   if (isError) {
      return (
         <section className="w-full border border-gray-200/80 rounded-xl flex flex-col shadow-md dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
            <span className="flex w-full px-8 pb-6 pt-8 justify-between items-center">
               <h2 className="text-3xl font-semibold">Week Nutrition</h2>
            </span>
            <div className="flex flex-col items-center gap-4 py-20">
               <p className="text-base text-red-600 dark:text-red-400 font-medium">
                  Error loading weekly nutrition data
               </p>
               <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
               >
                  Retry
               </Button>
            </div>
         </section>
      );
   }

   if (!weeklyNutrition || weeklyNutrition.totalMeals === 0) {
      return (
         <section className="w-full border border-gray-200/80 rounded-xl flex flex-col shadow-md dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
            <span className="flex w-full px-8 pb-6 pt-8 justify-between items-center">
               <h2 className="text-3xl font-semibold">Week Nutrition</h2>
            </span>
            <div className="flex flex-col items-center gap-4 py-20">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">
                     <ChefHat size={24} />
                  </span>
               </div>
               <p className="text-base text-muted-foreground text-center">
                  No meals cooked this week yet.
                  <br />
                  Start cooking to see your nutrition breakdown!
               </p>
            </div>
         </section>
      );
   }

   const pieData = [
      {
         name: "Protein",
         value: weeklyNutrition?.totalNutritionPerWeek.protein || 0,
      },
      {
         name: "Carbs",
         value: weeklyNutrition?.totalNutritionPerWeek.carbs || 0,
      },
      { name: "Fat", value: weeklyNutrition?.totalNutritionPerWeek.fat || 0 },
   ];

   const COLORS = ["#1976D2", "#388E3C", "#FBC02D"]; // Carbs, Fat, Protein

   const renderLabel = (entry: any) => {
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((entry.value / total) * 100).toFixed(1) || 0;
      return `${entry.name}: ${entry.value.toFixed(1)}g (${percentage}%)`;
   };

   function CustomTooltip({ active, payload }: any) {
      if (active && payload && payload.length) {
         const data = payload[0];
         const total = pieData.reduce((sum, item) => sum + item.value, 0);
         const percentage = ((data.value / total) * 100).toFixed(1);
         return (
            <div className="custom-tooltip bg-white p-2 rounded-md shadow-md border border-gray-200">
               <p className="text-sm text-foreground">{data.name}</p>
               <p className="text-sm text-foreground font-medium">
                  {data.value} g ({percentage}%)
               </p>
            </div>
         );
      }
      return null;
   }

   return (
      <section className="w-full border border-gray-200/80 rounded-xl flex flex-col shadow-md dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
         <span className="flex w-full px-4 sm:px-8 pb-4 sm:pb-6 pt-6 sm:pt-8 justify-center sm:justify-between items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center sm:text-left">Week Nutrition</h2>
         </span>

         <div className="w-full px-4 sm:px-8 pb-6 sm:pb-8 pointer-events-none">
            <div className="relative h-80 sm:h-96 md:h-120">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={150}
                        paddingAngle={5}
                        animationDuration={1200}
                        animationBegin={0}
                        label={renderLabel}
                        labelLine={false}>
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                     </Pie>
                     <Tooltip content={<CustomTooltip /> } wrapperStyle={{ zIndex: 1000 }} />
                  </PieChart>
               </ResponsiveContainer>

               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col gap-4">
                  <div>
                     <div className="text-2xl font-bold text-calories">
                        {weeklyNutrition?.totalNutritionPerWeek.calories.toFixed(
                           0
                        ) || 0}
                     </div>
                     <div className="text-sm text-muted-foreground">
                        Total Calories
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-carbs">
                     {weeklyNutrition?.totalNutritionPerWeek.carbs.toFixed(0) ||
                        0}
                     g
                  </div>
                  <div className="text-xs text-carbs">Carbs</div>
               </div>
               <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-fat">
                     {weeklyNutrition?.totalNutritionPerWeek.fat.toFixed(0) ||
                        0}
                     g
                  </div>
                  <div className="text-xs text-fat">Fat</div>
               </div>
               <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-protein">
                     {weeklyNutrition?.totalNutritionPerWeek.protein.toFixed(
                        0
                     ) || 0}
                     g
                  </div>
                  <div className="text-xs text-protein">Protein</div>
               </div>
            </div>
         </div>
      </section>
   );
}

import { BarChart3, TrendingUp } from "lucide-react";

export default function WeekNutrition() {
    return (
        <section className="w-full border border-gray-200/80 rounded-lg flex flex-col items-center justify-center shadow-md dark:shadow-muted-foreground/10 5">
            <span className="flex w-full px-6 pb-4 pt-6 justify-between">
                <h2 className="text-2xl font-medium">Week Nutrition</h2>
                <span className="flex items-center text-success gap-1">
                    <p className=" font-semibold"><TrendingUp size={18} /></p>
                    <p className="font-semibold">+12%</p>
                </span>
            </span>
            <div>
                <div className="flex flex-col items-center gap-2 py-16">
                    <div className="text-muted-foreground">
                        <BarChart3 size={55} />
                    </div>
                    <p className="text-muted-foreground">No nutrition data yet. Track your meals to see your progress!</p>
                </div>
            </div>
        </section>
    )
}
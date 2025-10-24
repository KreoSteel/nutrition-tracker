import { BarChart3, TrendingUp } from "lucide-react";

export default function WeekNutrition() {
    return (
        <section className="w-full border border-gray-200/80 rounded-xl flex flex-col items-center justify-center shadow-md dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
            <span className="flex w-full px-8 pb-6 pt-8 justify-between items-center">
                <h2 className="text-3xl font-semibold">Week Nutrition</h2>
                <span className="flex items-center text-success gap-1.5">
                    <p className="font-semibold"><TrendingUp size={20} /></p>
                    <p className="font-semibold text-base">+12%</p>
                </span>
            </span>
            <div>
                <div className="flex flex-col items-center gap-3 py-20">
                    <div className="text-muted-foreground">
                        <BarChart3 size={64} />
                    </div>
                    <p className="text-muted-foreground text-base">No nutrition data yet. Track your meals to see your progress!</p>
                </div>
            </div>
        </section>
    )
}
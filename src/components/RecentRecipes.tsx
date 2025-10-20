import { ChefHat } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecentRecipes() {
    return (
        <section className="w-full border border-gray-200/80 rounded-xl flex flex-col items-center justify-center shadow-md dark:shadow-muted-foreground/10 bg-white dark:bg-gray-950">
            <span className="flex w-full px-8 pb-6 pt-8 justify-between items-center">
                <h2 className="text-3xl font-semibold">Recent Recipes</h2>
                <Link className="flex items-center gap-1.5 text-primary text-base font-semibold hover:text-primary/80 transition-all" href="/recipes">View All <ArrowRight size={20} /></Link>
            </span>
            <div>
                <div className="flex flex-col items-center gap-3 py-20">
                    <div className="text-muted-foreground">
                        <ChefHat size={64} />
                    </div>
                    <p className="text-muted-foreground text-base">No recipes yet. Create your first recipe!</p>
                </div>
            </div>
        </section>
    )
}
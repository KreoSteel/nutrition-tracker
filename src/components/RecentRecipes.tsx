import { ChefHat } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecentRecipes() {
    return (
        <section className="w-full border border-gray-200/80 rounded-lg flex flex-col items-center justify-center shadow-md dark:shadow-muted-foreground/10">
            <span className="flex w-full px-6 pb-4 pt-6 justify-between">
                <h2 className="text-2xl font-medium">Recent Recipes</h2>
                <Link className="flex items-center gap-1 text-primary font-semibold hover:text-primary/80 transition-all" href="/recipes">View All <ArrowRight size={18} /></Link>
            </span>
            <div>
                <div className="flex flex-col items-center gap-2 py-16">
                    <div className="text-muted-foreground">
                        <ChefHat size={55} />
                    </div>
                    <p className="text-muted-foreground">No recipes yet. Create your first recipe!</p>
                </div>
            </div>
        </section>
    )
}
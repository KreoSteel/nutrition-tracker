import { Utensils } from "lucide-react";

export default function CookingHistory() {
    return (
        <section className="w-full flex flex-col items-center justify-center">
            <span className="flex w-full px-6 pb-4 pt-6 justify-center items-center">
                <h2 className="text-2xl font-medium">Recent Cooking History</h2>
            </span>
            <div>
                <div className="flex flex-col items-center gap-2 py-16">
                    <div className="text-muted-foreground">
                        <Utensils size={55} />
                    </div>
                    <p className="text-muted-foreground">No cooking history yet. Cook something to see your history!</p>
                </div>
            </div>
        </section>
    )
}
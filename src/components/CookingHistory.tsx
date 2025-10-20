import { Utensils } from "lucide-react";

export default function CookingHistory() {
  return (
    <section className="w-full flex flex-col items-center justify-center bg-muted/30 py-16 px-8 rounded-xl shadow-sm">
      <span className="flex w-full px-8 pb-6 pt-8 justify-center items-center">
        <h2 className="text-3xl font-semibold">Recent Cooking History</h2>
      </span>
      <div>
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="text-muted-foreground">
            <Utensils size={64} />
          </div>
          <p className="text-muted-foreground text-base">
            No cooking history yet. Cook something to see your history!
          </p>
        </div>
      </div>
    </section>
  );
}

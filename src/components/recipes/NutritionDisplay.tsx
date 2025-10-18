import { NutritionalData } from "../../../utils/calculations/nutrition";
import { calculateNutritionPerServing } from "../../../utils/calculations/nutrition";

interface NutritionDisplayProps {
    nutrition: NutritionalData;
    servings: number;
    showPerServing: boolean;
}

export default function NutritionDisplay({ nutrition, servings = 1, showPerServing = false }: NutritionDisplayProps) {
    const displayedNutrition = showPerServing ? calculateNutritionPerServing(nutrition, servings) : nutrition;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Number(displayedNutrition.calories).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Calories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Number(displayedNutrition.protein).toFixed(2)}g
          </div>
          <div className="text-sm text-muted-foreground">Protein</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Number(displayedNutrition.carbs).toFixed(2)}g
          </div>
          <div className="text-sm text-muted-foreground">Carbs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {Number(displayedNutrition.fat).toFixed(2)}g
          </div>
          <div className="text-sm text-muted-foreground">Fat</div>
        </div>
      </div>
    )
}
"use client";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { IngredientUpdateForm } from "../forms/IngredientUpdateForm";
import { SortableHeader } from "@/components/layout/SortableHeader";
import { useIngredients } from "../hooks/useIngredients";
import { NutritionFilters } from "@/components/ui/NutritionFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useRef } from "react";
import { IngredientCreateForm } from "@/app/forms/IngredientCreateForm";
import { IngredientResponse } from "../../../utils/schemas";
import IngredientDelete from "../forms/IngredientDelete";

export default function IngredientsPage() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchParams.get("query") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

  const [filters, setFilters] = useState({
    calories: { min: 0, max: 900 },
    protein: { min: 0, max: 100 },
    carbs: { min: 0, max: 100 },
    fat: { min: 0, max: 100 },
  });

  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientResponse | null>(null);

  const updateFilter = (
    nutrient: "protein" | "carbs" | "fat" | "calories",
    min: number,
    max: number
  ) => {
    setFilters((prev) => ({ ...prev, [nutrient]: { min, max } }));
  };
  type SortableField =
    | "name"
    | "caloriesPer100g"
    | "proteinPer100g"
    | "carbsPer100g"
    | "fatPer100g"
    | "category"
    | "createdAt";

  const [sortState, setSortState] = useState<
    | {
        field: SortableField;
        order: "asc" | "desc";
      }
    | undefined
  >(undefined);

  const handleSort = (field: SortableField) => {
    setSortState((prev) => {
      if (!prev || prev.field !== field) {
        return { field, order: "asc" };
      } else if (prev.order === "asc") {
        return { field, order: "desc" };
      } else {
        return { field, order: "asc" };
      }
    });
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useIngredients({
    search: searchTerm,
    sortBy: sortState?.field,
    sortOrder: sortState?.order,
    minCalories: filters.calories.min !== 0 ? filters.calories.min : undefined,
    maxCalories:
      filters.calories.max !== 900 ? filters.calories.max : undefined,
    minProtein: filters.protein.min !== 0 ? filters.protein.min : undefined,
    maxProtein: filters.protein.max !== 100 ? filters.protein.max : undefined,
    minCarbs: filters.carbs.min !== 0 ? filters.carbs.min : undefined,
    maxCarbs: filters.carbs.max !== 100 ? filters.carbs.max : undefined,
    minFat: filters.fat.min !== 0 ? filters.fat.min : undefined,
    maxFat: filters.fat.max !== 100 ? filters.fat.max : undefined,
  });
  const filteredIngredients = data?.pages.flatMap((page) => page.data);
  const totalIngredients = data?.pages[0].totalIngredients;
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="w-full mt-10 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row w-full justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">Ingredients</h1>
          <h3 className="text-muted-foreground text-sm">
            Total Ingredients: {totalIngredients}
          </h3>
        </div>
        <IngredientCreateForm>
          <Button>Add Ingredient</Button>
        </IngredientCreateForm>
      </div>
      <div className="w-full flex flex-col gap-4">
        <NutritionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          inputValue={inputValue}
          setInputValue={setInputValue}
          fatMin={filters.fat.min}
          fatMax={filters.fat.max}
          onChangeFat={(min, max) => updateFilter("fat", min, max)}
          carbsMin={filters.carbs.min}
          carbsMax={filters.carbs.max}
          onChangeCarbs={(min, max) => updateFilter("carbs", min, max)}
          proteinMin={filters.protein.min}
          proteinMax={filters.protein.max}
          onChangeProtein={(min, max) => updateFilter("protein", min, max)}
          caloriesMin={filters.calories.min}
          caloriesMax={filters.calories.max}
          onChangeCalories={(min, max) => updateFilter("calories", min, max)}
        />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table className="p-20">
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 text-xl">
              <SortableHeader
                field="name"
                sortState={sortState}
                onSort={handleSort}
              >
                Name
              </SortableHeader>
              <SortableHeader
                field="caloriesPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Calories
              </SortableHeader>
              <SortableHeader
                field="proteinPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Protein
              </SortableHeader>
              <SortableHeader
                field="carbsPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Carbs
              </SortableHeader>
              <SortableHeader
                field="fatPer100g"
                sortState={sortState}
                onSort={handleSort}
              >
                Fat
              </SortableHeader>
              <SortableHeader
                field="category"
                sortState={sortState}
                onSort={handleSort}
              >
                Category
              </SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading ingredients...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-red-500"
                >
                  Failed to load ingredients. Please try again.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && filteredIngredients?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No ingredients found.
                </TableCell>
              </TableRow>
            )}

            {filteredIngredients?.map((ingredient: IngredientResponse) => (
              <TableRow
                key={ingredient.id}
                className="text-[15px] text-muted-foreground"
              >
                <TableCell className="text-foreground max-w-xl">
                  <div className="line-clamp-2" title={ingredient.name}>
                    {ingredient.name}
                  </div>
                </TableCell>
                <TableCell>
                  {ingredient.caloriesPer100g.toString()}kcal
                </TableCell>
                <TableCell>{ingredient.proteinPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.carbsPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.fatPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.category}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedIngredient(ingredient);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <IngredientDelete ingredient={ingredient}>
                      <Button type="button" size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </IngredientDelete>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div ref={observerRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="text-center py-4 text-muted-foreground">
            Loading more ingredients...
          </div>
        )}

        {!hasNextPage &&
          filteredIngredients?.length &&
          filteredIngredients.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No more ingredients to load
            </div>
          )}
      </div>
      {selectedIngredient && (
        <IngredientUpdateForm
          key={selectedIngredient.id}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          ingredient={selectedIngredient}
        />
      )}
    </div>
  );
}

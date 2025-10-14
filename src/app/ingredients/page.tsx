"use client";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { IngredientUpdateForm } from "../forms/IngredientUpdateForm";
import { SortableHeader } from "@/components/layout/SortableHeader";
import { useIngredients } from "../hooks/useIngredients";
import { NutritionFilters } from "@/components/ui/NutritionFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useRef } from "react";
import { IngredientCreateForm } from "@/app/forms/IngredientCreateForm";
import { IngredientQuery, IngredientResponse } from "../../../utils/schemas";

export default function IngredientsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchParams.get("query") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");
  const [filters, setFilters] = useState({} as Partial<IngredientQuery>);
  const [caloriesMin, setCaloriesMin] = useState(0);
  const [caloriesMax, setCaloriesMax] = useState(900);
  const [proteinMin, setProteinMin] = useState(0);
  const [proteinMax, setProteinMax] = useState(100);
  const [carbsMin, setCarbsMin] = useState(0);
  const [carbsMax, setCarbsMax] = useState(100);
  const [fatMin, setFatMin] = useState(0);
  const [fatMax, setFatMax] = useState(100);
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientResponse | null>(null);

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
    minCalories: caloriesMin !== 0 ? caloriesMin : undefined,
    maxCalories: caloriesMax !== 900 ? caloriesMax : undefined,
    minProtein: proteinMin !== 0 ? proteinMin : undefined,
    maxProtein: proteinMax !== 100 ? proteinMax : undefined,
    minCarbs: carbsMin !== 0 ? carbsMin : undefined,
    maxCarbs: carbsMax !== 100 ? carbsMax : undefined,
    minFat: fatMin !== 0 ? fatMin : undefined,
    maxFat: fatMax !== 100 ? fatMax : undefined,
  });
  const filteredIngredients = data?.pages.flatMap((page: any) => page.data);
  const observerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback((term: string) => {
    if (term.length < 2 && term.length > 0) return;
    if (!term.trim()) {
      setSearchTerm("");
      const params = new URLSearchParams(searchParams);
      params.delete("query");
      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    setSearchTerm(term);
    const params = new URLSearchParams(searchParams);
    params.set("query", term);
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    const query = searchParams.get("query") || "";
    setSearchTerm(query);
    setInputValue(query);
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="w-full mt-10 flex flex-col gap-8">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-3xl">Ingredients</h1>
        <IngredientCreateForm>
          <Button>Add Ingredient</Button>
        </IngredientCreateForm>
      </div>
      <div className="w-full flex flex-col gap-4">
        <NutritionFilters
          fatMin={fatMin}
          fatMax={fatMax}
          onChangeFat={(min, max) => {
            setFatMin(min);
            setFatMax(max);
          }}
          carbsMin={carbsMin}
          carbsMax={carbsMax}
          onChangeCarbs={(min, max) => {
            setCarbsMin(min);
            setCarbsMax(max);
          }}
          proteinMin={proteinMin}
          proteinMax={proteinMax}
          onChangeProtein={(min, max) => {
            setProteinMin(min);
            setProteinMax(max);
          }}
          caloriesMin={caloriesMin}
          caloriesMax={caloriesMax}
          onChangeCalories={(min, max) => {
            setCaloriesMin(min);
            setCaloriesMax(max);
          }}
        />
        <div className="w-[40%] relative">
          <Search
            size={22}
            className="text-[#8c6e5f] absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            className="bg-input-background px-4 py-2 pl-10 h-12 placeholder:text-[#8c6e5f]"
            placeholder="Search ingredients"
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>
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
                <TableCell className="text-foreground">
                  {ingredient.name}
                </TableCell>
                <TableCell>
                  {ingredient.caloriesPer100g.toString()}kcal
                </TableCell>
                <TableCell>{ingredient.proteinPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.carbsPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.fatPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.category}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedIngredient(ingredient);
                      setIsOpen(true);
                    }}
                  >
                    Edit
                  </Button>
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

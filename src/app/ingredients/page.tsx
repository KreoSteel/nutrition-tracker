"use client";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useIngredients } from "../hooks/useIngredients";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";

export default function IngredientsPage() {
  const [search, setSearch] = useState("");
  const { data: ingredients } = useIngredients();
  const filteredIngredients = ingredients?.filter((ingredient) => ingredient.name.toLowerCase().includes(search.toLowerCase()) || ingredient.category?.toLowerCase().includes(search.toLowerCase()))

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams);
    if (e.target.value === "") {
      params.delete("search");
      setSearch("");
    } else {
      params.set("search", e.target.value);
      setSearch(e.target.value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <form className="w-full mt-10 flex flex-col gap-8">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-3xl">Ingredients</h1>
        <Button>Add Ingredient</Button>
      </div>
      <div className="w-[40%] relative flex flex-col items-center">
        <Search
          size={22}
          className="text-[#8c6e5f] absolute left-3 top-1/2 -translate-y-1/2"
        />
        <Input
          className="bg-input-background px-4 py-2 pl-10 h-12 placeholder:text-[#8c6e5f]"
          placeholder="Search ingredients"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table className="p-20">
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 text-xl">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Calories</TableHead>
              <TableHead className="font-semibold">Protein</TableHead>
              <TableHead className="font-semibold">Carbs</TableHead>
              <TableHead className="font-semibold">Fat</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients?.map((ingredient) => (
              <TableRow
                key={ingredient.id}
                className="text-[15px] text-muted-foreground"
              >
                <TableCell className="text-foreground">
                  {ingredient.name}
                </TableCell>
                <TableCell>{ingredient.caloriesPer100g.toString()}</TableCell>
                <TableCell>{ingredient.proteinPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.carbsPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.fatPer100g.toString()}g</TableCell>
                <TableCell>{ingredient.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </form>
  );
}

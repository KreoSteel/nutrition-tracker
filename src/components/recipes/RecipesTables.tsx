import { useState } from "react";
import { SortableHeader } from "../layout/SortableHeader";
import { Table, TableHead, TableHeader, TableRow } from "../ui/table";

type SortableField =
  | "name"
  | "servings"
  | "calories"
  | "carbs"
  | "protein"
  | "fat"
  | "rating"
  | "isFavorite";

export default function RecipesTables() {
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
  return (
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
              field="calories"
              sortState={sortState}
              onSort={handleSort}
            >
              Calories
            </SortableHeader>
            <SortableHeader
              field="protein"
              sortState={sortState}
              onSort={handleSort}
            >
              Protein
            </SortableHeader>
            <SortableHeader
              field="carbs"
              sortState={sortState}
              onSort={handleSort}
            >
              Carbs
            </SortableHeader>
            <SortableHeader
              field="fat"
              sortState={sortState}
              onSort={handleSort}
            >
              Fat
            </SortableHeader>
            <SortableHeader
              field="rating"
              sortState={sortState}
              onSort={handleSort}
            >
              Rating
            </SortableHeader>
            <SortableHeader
              field="isFavorite"
              sortState={sortState}
              onSort={handleSort}
            >
              Favorite
            </SortableHeader>
          </TableRow>
        </TableHeader>
      </Table>
    </div>
  );
}

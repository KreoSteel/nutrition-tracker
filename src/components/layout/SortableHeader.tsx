import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead } from "../ui/table";
import clsx from "clsx";

type SortableField =
  | "name"
  | "caloriesPer100g"
  | "proteinPer100g"
  | "carbsPer100g"
  | "fatPer100g"
  | "category"
  | "createdAt";

export function SortableHeader({
  children,
  className = "",
  field,
  sortState,
  onSort,
}: {
  field: SortableField;
  children: React.ReactNode;
  className?: string;
  sortState: { field: SortableField | undefined; order: "asc" | "desc" } | undefined;
  onSort: (field: SortableField) => void;
}) {
  const isActive = sortState?.field === field;
  const order = isActive ? sortState?.order : "asc";

  return (
    <TableHead className={clsx(className, "font-semibold cursor-pointer")}>
      <div className="flex items-center gap-2" onClick={() => onSort(field)}>
        {children}
        {isActive ? (
          order === "asc" ? (
            <ChevronUp className="h-4 w-4 shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          )
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        )}
      </div>
    </TableHead>
  )
}

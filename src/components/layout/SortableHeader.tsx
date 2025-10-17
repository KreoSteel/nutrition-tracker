import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead } from "../ui/table";
import clsx from "clsx";

export function SortableHeader<T extends string>({
  children,
  className = "",
  field,
  sortState,
  onSort,
}: {
  field: T;
  children: React.ReactNode;
  className?: string;
  sortState: { field: T; order: "asc" | "desc" } | undefined;
  onSort: (field: T) => void;
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
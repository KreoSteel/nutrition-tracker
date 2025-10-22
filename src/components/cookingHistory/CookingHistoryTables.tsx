import { Heart, CalendarDays, Clock, Star, Eye, Edit, Trash2 } from "lucide-react"
import { Table, TableCell, TableHead, TableBody, TableHeader, TableRow } from "../ui/table"
import { useCookingHistory } from "@/app/hooks/useCookingHistory";
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "../ui/button"
import { ChefHat } from "lucide-react"

export default function CookingHistoryTables() {
    const { data: cookingHistory } = useCookingHistory();
    return (
        <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-950">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-gray-900/50 hover:bg-gray-50/80 dark:hover:bg-gray-900/50 border-b-2 border-gray-200 dark:border-gray-800 h-16">
              <TableHead className="text-lg font-semibold">Recipe</TableHead>
              <TableHead className="text-lg font-semibold">Date & Time</TableHead>
              <TableHead className="text-lg font-semibold">Rating</TableHead>
              <TableHead className="text-lg font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cookingHistory?.pages.flatMap((page) => page.data).map((entry) => (
              <TableRow
                key={entry.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <TableCell className="py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {entry.recipe.name}
                      </h3>
                      {entry.recipe.isFavorite && (
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.recipe.description}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell className="py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      {format(entry.cookedAt, "MM/dd/yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {format(entry.cookedAt, "HH:mm")}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="py-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-lg font-medium">
                      {entry.recipe.rating}/100
                    </span>
                  </div>
                </TableCell>
                
                <TableCell className="py-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    )
}
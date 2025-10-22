"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Clock, 
  ChefHat, 
  Star,
  Heart,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  CalendarDays,
  TrendingUp,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCookingHistory } from "../hooks/useCookingHistory";
import { format } from "date-fns";
import CookingHistoryTables from "@/components/cookingHistory/CookingHistoryTables";

export default function CookingHistoryPage() {
  const { data: cookingHistory } = useCookingHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("cookedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateFilter, setDateFilter] = useState("all");

  return (
    <div className="w-full mt-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold">Cooking History</h1>
            <p className="text-muted-foreground text-lg font-light">
              Track your cooking journey and discover patterns
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">24</div>
            <div className="text-sm text-muted-foreground">Total Cooks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">7</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <CookingHistoryTables />

      {/* Empty State (Hidden for design) */}
      <div className="hidden">
        <div className="flex flex-col items-center justify-center py-20 border border-border rounded-xl bg-white dark:bg-gray-950">
          <div className="text-muted-foreground mb-4">
            <ChefHat size={64} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Cooking History Yet</h3>
          <p className="text-muted-foreground text-center mb-6">
            Start cooking recipes to see your history here. Click "I Cooked This Today" on any recipe to begin tracking.
          </p>
          <Link href="/recipes">
            <Button>Browse Recipes</Button>
          </Link>
        </div>
      </div>

      {/* Analytics Section (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Most Cooked</h3>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
            Chicken Pasta
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-500">
            5 times this month
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Weekly Average</h3>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
            3.2 meals
          </div>
          <div className="text-sm text-green-600 dark:text-green-500">
            per week
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Current Streak</h3>
          </div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-1">
            3 days
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-500">
            Keep it up!
          </div>
        </div>
      </div>
    </div>
  );
}

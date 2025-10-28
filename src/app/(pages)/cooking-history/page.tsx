"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCookingStats } from "@/app/hooks/useCookingHistory";
import CookingHistoryTables from "@/components/cooking-history/CookingHistoryTables";
import Statistics from "@/components/cooking-history/Statistics";
import DateFilter from "@/components/cooking-history/DateFilter";
import { useDebouncedCallback } from "use-debounce";

export default function CookingHistoryPage() {
   const [searchTerm, setSearchTerm] = useState("");
   const [inputValue, setInputValue] = useState("");
   const [startDate, setStartDate] = useState<Date | undefined>();
   const [endDate, setEndDate] = useState<Date | undefined>();

   const debouncedSearch = useDebouncedCallback(
      (value: string) => {
         setSearchTerm(value);
      },
      500
   );

   const handleClear = () => {
      setStartDate(undefined);
      setEndDate(undefined);
      setSearchTerm("");
      setInputValue("");
   };

   const { data: cookingStats } = useCookingStats();
   const totalCooks = cookingStats?.totalCooks || 0;
   const thisWeekCooks = cookingStats?.thisWeekCooks || 0;
   const currentStreak = cookingStats?.currentStreak || 0;

   return (
      <div className="w-full mt-10 flex flex-col gap-8">
         <div className="flex flex-col lg:flex-row w-full justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col gap-2">
               <h1 className="text-3xl font-bold">Cooking History</h1>
               <p className="text-muted-foreground text-lg">
                  Track your cooking journey and discover patterns
               </p>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                     {totalCooks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                     Total Cooks
                  </div>
               </div>
               <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                     {thisWeekCooks}
                  </div>
                  <div className="text-sm text-muted-foreground">This Week</div>
               </div>
               <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                     {currentStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">
                     Day Streak
                  </div>
               </div>
            </div>
         </div>

         <Statistics />

         <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex-1 flex flex-col gap-4">
               <h1 className="text-2xl font-semibold">Filters</h1>
               <div className="relative flex gap-4 items-center justify-center">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                     placeholder="Search cooking history..."
                     value={inputValue}
                     onChange={(e) => {
                        setInputValue(e.target.value);
                        debouncedSearch(e.target.value);
                     }}
                     className="pl-10"
                  />
                  <DateFilter
                     startDate={startDate}
                     endDate={endDate}
                     onStartDateChange={setStartDate}
                     onEndDateChange={setEndDate}
                     onClear={handleClear}
                  />
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-6">
            <CookingHistoryTables searchTerm={searchTerm} startDate={startDate} endDate={endDate} />
         </div>
      </div>
   );
}

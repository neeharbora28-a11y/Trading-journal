import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO } from "date-fns";
import { Trade } from "@/store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterTradesByDateRange(trades: Trade[], range: string): Trade[] {
  if (range === "All Time") return trades;
  
  return trades.filter(trade => {
    // Trade date is in YYYY-MM-DD format
    const date = parseISO(trade.date);
    
    switch (range) {
      case "Today":
        return isToday(date);
      case "This Week":
        return isThisWeek(date, { weekStartsOn: 1 });
      case "This Month":
        return isThisMonth(date);
      case "This Year":
        return isThisYear(date);
      default:
        return true;
    }
  });
}

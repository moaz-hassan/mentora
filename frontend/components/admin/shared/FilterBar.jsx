"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "./DateRangePicker";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FilterBar - Reusable filter bar with search, date range, and status filters
 * @param {Function} onSearch - Search handler
 * @param {Function} onDateRangeChange - Date range change handler
 * @param {Function} onStatusChange - Status filter change handler
 * @param {Function} onClear - Clear all filters handler
 * @param {Array} statusOptions - Status filter options [{value, label}]
 * @param {string} searchPlaceholder - Search input placeholder
 * @param {boolean} showSearch - Show search input
 * @param {boolean} showDateRange - Show date range picker
 * @param {boolean} showStatus - Show status filter
 * @param {string} className - Additional CSS classes
 */
export function FilterBar({
  onSearch,
  onDateRangeChange,
  onStatusChange,
  onClear,
  statusOptions = [],
  searchPlaceholder = "Search...",
  showSearch = true,
  showDateRange = true,
  showStatus = true,
  className,
  filters = {},
}) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "all");
  const [dateRange, setDateRange] = useState(filters.dateRange || { from: null, to: null });

  const handleSearch = (value) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    onStatusChange?.(value === "all" ? null : value);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  };

  const handleClear = () => {
    setSearchValue("");
    setStatus("all");
    setDateRange({ from: null, to: null });
    onClear?.();
  };

  const hasFilters = searchValue || status !== "all" || dateRange.from || dateRange.to;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      )}

      {showDateRange && (
        <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      )}

      {showStatus && statusOptions.length > 0 && (
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

export default FilterBar;

"use client";

import { useState } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const presets = [
  { label: "Today", value: "today", getRange: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 days", value: "7days", getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", value: "30days", getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This month", value: "thisMonth", getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", value: "lastMonth", getRange: () => {
    const lastMonth = subMonths(new Date(), 1);
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
  }},
  { label: "This year", value: "thisYear", getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: "Custom", value: "custom", getRange: () => ({ from: null, to: null }) },
];

/**
 * DateRangePicker - Date range selection with presets
 * @param {Object} value - Current date range { from, to }
 * @param {Function} onChange - Change handler
 * @param {string} className - Additional CSS classes
 */
export function DateRangePicker({ value, onChange, className }) {
  const [preset, setPreset] = useState("30days");
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (presetValue) => {
    setPreset(presetValue);
    const selectedPreset = presets.find((p) => p.value === presetValue);
    if (selectedPreset && presetValue !== "custom") {
      onChange?.(selectedPreset.getRange());
    }
  };

  const handleDateSelect = (range) => {
    onChange?.(range);
    if (range?.from && range?.to) {
      setPreset("custom");
    }
  };

  const formatDateRange = () => {
    if (!value?.from) return "Select date range";
    if (!value?.to) return format(value.from, "MMM d, yyyy");
    return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-64",
              !value?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateRangePicker;

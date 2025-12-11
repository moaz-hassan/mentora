"use client";

import { Layers, Clock, CheckCircle, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All", icon: Layers },
  { id: "in-progress", label: "In Progress", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle },
  { id: "archived", label: "Archived", icon: Archive },
];

/**
 * Filter enrollments by status
 */
export function filterEnrollments(enrollments, filter) {
  if (!enrollments || !Array.isArray(enrollments)) return [];
  
  switch (filter) {
    case "in-progress":
      return enrollments.filter(
        (e) => e.progress?.completionPercentage < 100 && e.status !== "archived"
      );
    case "completed":
      return enrollments.filter(
        (e) => e.progress?.completionPercentage >= 100
      );
    case "archived":
      return enrollments.filter((e) => e.status === "archived");
    case "all":
    default:
      return enrollments;
  }
}

/**
 * Get counts for each filter
 */
export function getFilterCounts(enrollments) {
  if (!enrollments || !Array.isArray(enrollments)) {
    return { all: 0, "in-progress": 0, completed: 0, archived: 0 };
  }

  return {
    all: enrollments.length,
    "in-progress": enrollments.filter(
      (e) => e.progress?.completionPercentage < 100 && e.status !== "archived"
    ).length,
    completed: enrollments.filter(
      (e) => e.progress?.completionPercentage >= 100
    ).length,
    archived: enrollments.filter((e) => e.status === "archived").length,
  };
}

export default function CourseFilters({ activeFilter, onFilterChange, counts }) {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        const count = counts?.[filter.id] || 0;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{filter.label}</span>
            <span className={cn(
              "text-xs tabular-nums px-1.5 py-0.5 rounded-full",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "bg-muted-foreground/10"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

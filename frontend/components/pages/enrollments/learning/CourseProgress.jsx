"use client";

import { Progress } from "@/components/ui/progress";


export default function CourseProgress({
  percentage = 0,
  completedCount = 0,
  totalCount = 0,
}) {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Course Progress
        </span>
        <span className="text-sm font-semibold text-primary">
          {percentage}%
        </span>
      </div>
      <Progress value={percentage} className="h-2 mb-2" />
      <p className="text-xs text-muted-foreground">
        {completedCount} of {totalCount} lessons completed
      </p>
    </div>
  );
}

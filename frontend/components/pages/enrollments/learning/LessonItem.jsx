"use client";

import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";


export default function LessonItem({
  lesson,
  isActive = false,
  isCompleted = false,
  onClick,
}) {
  
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-accent/50",
        isActive && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      {}
      <div className="mt-0.5 flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : isActive ? (
          <PlayCircle className="h-4 w-4 text-primary" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isActive && "text-primary",
            isCompleted && !isActive && "text-muted-foreground"
          )}
        >
          {lesson.title}
        </p>
        {lesson.duration > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDuration(lesson.duration)}
          </p>
        )}
      </div>
    </button>
  );
}

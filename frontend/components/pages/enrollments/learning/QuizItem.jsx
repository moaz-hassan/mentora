"use client";

import { CheckCircle2, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * QuizItem - Individual quiz entry in the curriculum sidebar
 * Shows quiz title and completion status
 */
export default function QuizItem({
  quiz,
  isCompleted = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-accent/50"
      )}
    >
      {/* Status icon */}
      <div className="mt-0.5 flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <FileQuestion className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Quiz info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCompleted && "text-muted-foreground"
          )}
        >
          {quiz.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Quiz</p>
      </div>
    </button>
  );
}

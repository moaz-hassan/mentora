"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import LessonItem from "./LessonItem";
import QuizItem from "./QuizItem";


export default function SectionItem({
  section,
  sectionNumber,
  isExpanded = false,
  currentLessonId,
  currentQuizId,
  completedLessons = [],
  completedQuizzes = [],
  onToggle,
  onLessonSelect,
  onQuizSelect,
}) {
  
  const items = [
    ...(section.Lessons || []).map((l) => ({ ...l, type: "lesson" })),
    ...(section.Quizzes || []).map((q) => ({ ...q, type: "quiz" })),
  ].sort((a, b) => a.order_number - b.order_number);

  
  const totalItems = items.length;
  const completedItems =
    (section.Lessons || []).filter((l) => completedLessons.includes(l.id)).length +
    (section.Quizzes || []).filter((q) => completedQuizzes.includes(q.id)).length;

  const isFullyCompleted = totalItems > 0 && completedItems === totalItems;

  return (
    <div className="border-b last:border-b-0">
      {}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left",
          "hover:bg-accent/50 transition-colors",
          isFullyCompleted && "bg-green-50 dark:bg-green-950/20"
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">
            Section {sectionNumber}
          </p>
          <p className="text-sm font-medium truncate">{section.title}</p>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-muted-foreground">
            {completedItems}/{totalItems}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {}
      {isExpanded && (
        <div className="bg-muted/30">
          {items.map((item) =>
            item.type === "lesson" ? (
              <LessonItem
                key={item.id}
                lesson={item}
                isActive={currentLessonId === item.id}
                isCompleted={completedLessons.includes(item.id)}
                onClick={() => onLessonSelect(item.id)}
              />
            ) : (
              <QuizItem
                key={item.id}
                quiz={item}
                isCompleted={completedQuizzes.includes(item.id)}
                onClick={() => onQuizSelect(item.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

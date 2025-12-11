"use client";

import { ChevronRight } from "lucide-react";

/**
 * UpNextSection - Preview of upcoming lessons
 */
export default function UpNextSection({ lessons = [], onLessonSelect }) {
  // Format duration from seconds to readable format
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!lessons.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Up Next</h3>
      <div className="space-y-2">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onLessonSelect(lesson.id)}
            className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors text-left"
          >
            <div>
              <p className="font-medium">{lesson.title}</p>
              {lesson.duration > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formatDuration(lesson.duration)}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

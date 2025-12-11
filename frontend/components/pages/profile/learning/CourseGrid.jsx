"use client";

import LearningCourseCard from "./LearningCourseCard";
import { BookOpen } from "lucide-react";

export default function CourseGrid({ enrollments, emptyMessage = "No courses found" }) {
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start exploring courses to begin your learning journey.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {enrollments.map((enrollment) => (
        <LearningCourseCard
          key={enrollment.id}
          course={enrollment.Course}
          progress={enrollment.progress?.completionPercentage}
          status={enrollment.status}
        />
      ))}
    </div>
  );
}

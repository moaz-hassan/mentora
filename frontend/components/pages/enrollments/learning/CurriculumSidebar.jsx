"use client";

import CourseProgress from "./CourseProgress";
import SectionItem from "./SectionItem";


export default function CurriculumSidebar({
  chapters = [],
  currentLessonId,
  currentQuizId,
  completedLessons = [],
  completedQuizzes = [],
  progressPercentage = 0,
  totalLessons = 0,
  completedCount = 0,
  expandedSections = [],
  onLessonSelect,
  onQuizSelect,
  onToggleSection,
}) {
  
  const sortedChapters = [...chapters].sort(
    (a, b) => a.order_number - b.order_number
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {}
      <CourseProgress
        percentage={progressPercentage}
        completedCount={completedCount}
        totalCount={totalLessons}
      />

      {}
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Course Curriculum</h3>
      </div>

      {}
      <div className="flex-1 overflow-y-auto">
        {sortedChapters.map((chapter, index) => (
          <SectionItem
            key={chapter.id}
            section={chapter}
            sectionNumber={index + 1}
            isExpanded={expandedSections.includes(chapter.id)}
            currentLessonId={currentLessonId}
            currentQuizId={currentQuizId}
            completedLessons={completedLessons}
            completedQuizzes={completedQuizzes}
            onToggle={() => onToggleSection(chapter.id)}
            onLessonSelect={onLessonSelect}
            onQuizSelect={onQuizSelect}
          />
        ))}
      </div>
    </div>
  );
}

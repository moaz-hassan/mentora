"use client";

import { useMemo } from "react";

export function useCourseNavigation(chapters, currentLesson, currentQuiz) {
  
  const flattenedLessons = useMemo(() => {
    if (!chapters.length) return [];
    
    const lessons = [];
    chapters
      .sort((a, b) => a.order_number - b.order_number)
      .forEach((chapter) => {
        const chapterItems = [
          ...(chapter.Lessons || []).map((l) => ({ ...l, type: "lesson", chapterId: chapter.id })),
          ...(chapter.Quizzes || []).map((q) => ({ ...q, type: "quiz", chapterId: chapter.id })),
        ].sort((a, b) => a.order_number - b.order_number);
        
        lessons.push(...chapterItems);
      });
    
    return lessons;
  }, [chapters]);

  
  const totalLessons = useMemo(() => {
    return chapters.reduce((count, chapter) => {
      return count + (chapter.Lessons?.length || 0) + (chapter.Quizzes?.length || 0);
    }, 0);
  }, [chapters]);

  
  const currentIndex = useMemo(() => {
    if (!currentLesson && !currentQuiz) return -1;
    const currentId = currentLesson?.id || currentQuiz?.id;
    return flattenedLessons.findIndex((item) => item.id === currentId);
  }, [flattenedLessons, currentLesson, currentQuiz]);

  
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < flattenedLessons.length - 1 && currentIndex !== -1;

  
  const upNextLessons = useMemo(() => {
    if (currentIndex === -1) return [];
    return flattenedLessons
      .slice(currentIndex + 1, currentIndex + 4)
      .filter((item) => item.type === "lesson");
  }, [flattenedLessons, currentIndex]);

  return {
    flattenedLessons,
    totalLessons,
    currentIndex,
    hasPrevious,
    hasNext,
    upNextLessons
  };
}

"use client";

import { useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { markLessonComplete as markLessonCompleteAPI } from "@/lib/apiCalls/enrollments/enrollment.service";

export function useCourseProgress(enrollmentId, progress, setProgress, currentLesson) {
  // Track if 90% completion has been triggered for current lesson (prevents infinite requests)
  const completionTriggeredRef = useRef(null);

  // Calculate completed count
  const completedCount = useMemo(() => {
    return (progress.completedLessons?.length || 0) + (progress.completedQuizzes?.length || 0);
  }, [progress]);

  // Mark current lesson as complete
  // Skips API call if lesson is already completed
  const markLessonComplete = useCallback(
    async (lessonId) => {
      const targetLessonId = lessonId || currentLesson?.id;
      if (!targetLessonId) return;

      // Skip if lesson is already completed
      if (progress.completedLessons?.includes(targetLessonId)) {
        return;
      }

      try {
        const response = await markLessonCompleteAPI(enrollmentId, targetLessonId);

        if (response.success) {
          setProgress(response.data.progress);
          toast.success("Lesson completed!");
        }
      } catch (err) {
        toast.error("Failed to mark lesson as complete");
      }
    },
    [enrollmentId, currentLesson, progress.completedLessons, setProgress]
  );

  // Handle video progress - auto-complete at 90%
  // Uses ref to prevent multiple API calls for the same lesson
  const handleVideoProgress = useCallback(
    async (percentage) => {
      // Check if we should trigger completion
      if (
        percentage >= 90 && 
        currentLesson && 
        !progress.completedLessons?.includes(currentLesson.id) &&
        completionTriggeredRef.current !== currentLesson.id
      ) {
        // Mark this lesson as triggered to prevent duplicate calls
        completionTriggeredRef.current = currentLesson.id;
        await markLessonComplete(currentLesson.id);
      }
    },
    [currentLesson, progress.completedLessons, markLessonComplete]
  );

  const resetCompletionTrigger = useCallback(() => {
    completionTriggeredRef.current = null;
  }, []);

  const submitQuiz = useCallback(async (quizId, answers) => {
    try {
      const { submitQuiz: submitQuizAPI } = await import("@/lib/apiCalls/enrollments/enrollment.service");
      const response = await submitQuizAPI(enrollmentId, quizId, answers);

      if (response.success) {
        if (response.data.passed) {
          // Update progress if passed
          if (response.data.progress) {
             setProgress(response.data.progress);
          } else {
             // Fallback manual update if progress not returned
             setProgress((prev) => ({
               ...prev,
               completedQuizzes: [...(prev.completedQuizzes || []), quizId],
               quizScores: {
                 ...prev.quizScores,
                 [quizId]: response.data.score
               }
             }));
          }
          toast.success(`Quiz passed! Score: ${response.data.score}%`);
        } else {
          toast.error(`Quiz failed. Score: ${response.data.score}%. Try again!`);
        }
        return response.data;
      } else {
        toast.error(response.message || "Failed to submit quiz");
        return null;
      }
    } catch (err) {
      toast.error("Failed to submit quiz");
      return null;
    }
  }, [enrollmentId, setProgress]);

  return {
    completedCount,
    markLessonComplete,
    handleVideoProgress,
    resetCompletionTrigger,
    submitQuiz
  };
}

"use client";

import { useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { markLessonComplete as markLessonCompleteAPI } from "@/lib/apiCalls/enrollments/enrollment.service";

export function useCourseProgress(enrollmentId, progress, setProgress, currentLesson) {
  
  const completionTriggeredRef = useRef(null);

  
  const completedCount = useMemo(() => {
    return (progress.completedLessons?.length || 0) + (progress.completedQuizzes?.length || 0);
  }, [progress]);

  
  
  const markLessonComplete = useCallback(
    async (lessonId) => {
      const targetLessonId = lessonId || currentLesson?.id;
      if (!targetLessonId) return;

      
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

  
  
  const handleVideoProgress = useCallback(
    async (percentage) => {
      
      if (
        percentage >= 90 && 
        currentLesson && 
        !progress.completedLessons?.includes(currentLesson.id) &&
        completionTriggeredRef.current !== currentLesson.id
      ) {
        
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
          
          if (response.data.progress) {
             setProgress(response.data.progress);
          } else {
             
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

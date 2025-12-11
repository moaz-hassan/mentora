"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEnrollmentData } from "./useEnrollmentData";
import { useLessonContent } from "./useLessonContent";
import { useCourseNavigation } from "./useCourseNavigation";
import { useCourseProgress } from "./useCourseProgress";

export function useLearningPage(enrollmentId) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Enrollment Data (includes chatMembership)
  const {
    enrollment,
    course,
    chapters,
    progress,
    setProgress,
    chatMembership,
    isLoading,
    error,
    fetchEnrollment,
    initialLoadComplete
  } = useEnrollmentData(enrollmentId);

  // 2. Lesson Content
  const {
    currentLesson,
    currentQuiz,
    contentType,
    isLessonLoading,
    fetchLessonContent,
    fetchQuizContent
  } = useLessonContent(enrollmentId);

  // 3. Navigation Logic
  const {
    flattenedLessons,
    totalLessons,
    currentIndex,
    hasPrevious,
    hasNext,
    upNextLessons
  } = useCourseNavigation(chapters, currentLesson, currentQuiz);

  // 4. Progress Logic
  const {
    completedCount,
    markLessonComplete,
    handleVideoProgress,
    resetCompletionTrigger,
    submitQuiz
  } = useCourseProgress(enrollmentId, progress, setProgress, currentLesson);

  // 5. UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState([]);
  
  // Autoplay preference
  const [autoplay, setAutoplay] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("learning-autoplay") === "true";
    }
    return false;
  });

  // Update URL with lesson/quiz parameter
  const updateURL = useCallback((type, id) => {
    const params = new URLSearchParams();
    params.set(type, id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // Select a lesson
  const selectLesson = useCallback(
    (lessonId) => {
      if (currentLesson?.id === lessonId) return;
      
      resetCompletionTrigger();
      updateURL("lesson", lessonId);
      fetchLessonContent(lessonId).then((lesson) => {
        if (lesson) {
          setActiveTab("overview");
          // Expand section
          if (lesson.chapter_id) {
            setExpandedSections((prev) =>
              prev.includes(lesson.chapter_id) ? prev : [...prev, lesson.chapter_id]
            );
          }
        }
      });
    },
    [fetchLessonContent, currentLesson, updateURL, resetCompletionTrigger]
  );

  // Select a quiz
  const selectQuiz = useCallback(
    (quizId) => {
      if (currentQuiz?.id === quizId) return;
      
      updateURL("quiz", quizId);
      fetchQuizContent(quizId).then((quiz) => {
        if (quiz) {
          // Expand section
          if (quiz.chapter_id) {
            setExpandedSections((prev) =>
              prev.includes(quiz.chapter_id) ? prev : [...prev, quiz.chapter_id]
            );
          }
        }
      });
    },
    [fetchQuizContent, currentQuiz, updateURL]
  );

  // Navigate to next lesson
  const goToNextLesson = useCallback(async () => {
    if (!hasNext) return;

    // Mark current lesson as complete before moving
    if (currentLesson && !progress.completedLessons?.includes(currentLesson.id)) {
      await markLessonComplete(currentLesson.id);
    }

    const nextItem = flattenedLessons[currentIndex + 1];
    if (nextItem.type === "lesson") {
      selectLesson(nextItem.id);
    } else {
      selectQuiz(nextItem.id);
    }
  }, [
    hasNext,
    currentLesson,
    progress.completedLessons,
    markLessonComplete,
    flattenedLessons,
    currentIndex,
    selectLesson,
    selectQuiz,
  ]);

  // Navigate to previous lesson
  const goToPreviousLesson = useCallback(() => {
    if (!hasPrevious) return;

    const prevItem = flattenedLessons[currentIndex - 1];
    if (prevItem.type === "lesson") {
      selectLesson(prevItem.id);
    } else {
      selectQuiz(prevItem.id);
    }
  }, [hasPrevious, flattenedLessons, currentIndex, selectLesson, selectQuiz]);

  // Toggle section expand/collapse
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    setAutoplay((prev) => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("learning-autoplay", String(newValue));
      }
      return newValue;
    });
  }, []);

  // Handle video end (for autoplay)
  const handleVideoEnd = useCallback(() => {
    if (autoplay && hasNext) {
      goToNextLesson();
    }
  }, [autoplay, hasNext, goToNextLesson]);

  // Initial Data Loading Effect
  useEffect(() => {
    if (enrollmentId && !initialLoadComplete.current) {
      fetchEnrollment().then((data) => {
        if (!data) return;

        // Expand section containing current lesson
        if (data.progress?.currentChapterId) {
          setExpandedSections([data.progress.currentChapterId]);
        } else if (data.Course?.Chapters?.length > 0) {
          setExpandedSections([data.Course.Chapters[0].id]);
        }

        // Determine which lesson/quiz to load
        const urlLessonId = searchParams.get("lesson");
        const urlQuizId = searchParams.get("quiz");
        
        if (urlLessonId) {
          fetchLessonContent(urlLessonId);
        } else if (urlQuizId) {
          fetchQuizContent(urlQuizId);
        } else if (data.progress?.currentLessonId) {
          fetchLessonContent(data.progress.currentLessonId);
          updateURL("lesson", data.progress.currentLessonId);
        } else {
          // Load first lesson
          const firstChapter = data.Course?.Chapters?.sort(
            (a, b) => a.order_number - b.order_number
          )[0];
          const firstLesson = firstChapter?.Lessons?.sort(
            (a, b) => a.order_number - b.order_number
          )[0];
          if (firstLesson) {
            fetchLessonContent(firstLesson.id);
            updateURL("lesson", firstLesson.id);
          }
        }
      });
    }
  }, [enrollmentId, fetchEnrollment, searchParams, fetchLessonContent, fetchQuizContent, updateURL, initialLoadComplete]);

  return {
    // Data
    enrollment,
    course,
    chapters,
    progress,
    currentLesson,
    currentQuiz,
    contentType,
    flattenedLessons,
    upNextLessons,
    totalLessons,
    completedCount,
    chatMembership,

    // State
    isLoading,
    isLessonLoading,
    error,
    activeTab,
    autoplay,
    expandedSections,
    hasPrevious,
    hasNext,

    // Actions
    selectLesson,
    selectQuiz,
    markLessonComplete,
    handleVideoProgress,
    goToNextLesson,
    goToPreviousLesson,
    setActiveTab,
    toggleAutoplay,
    toggleSection,
    handleVideoEnd,
    submitQuiz,
    refetch: fetchEnrollment,
  };
}

export default useLearningPage;

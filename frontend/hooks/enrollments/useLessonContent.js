"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getLessonDetail, getQuizDetail } from "@/lib/apiCalls/enrollments/enrollment.service";

export function useLessonContent(enrollmentId) {
  
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [contentType, setContentType] = useState("lesson"); 
  const [isLessonLoading, setIsLessonLoading] = useState(false);

  
  const fetchLessonContent = useCallback(
    async (lessonId) => {
      setIsLessonLoading(true);
      setContentType("lesson");
      setCurrentQuiz(null);

      try {
        const response = await getLessonDetail(enrollmentId, lessonId);

        if (!response.success) {
          toast.error(response.message || "Failed to load lesson");
          return null;
        }

        setCurrentLesson(response.data);
        return response.data;
      } catch (err) {
        toast.error("Failed to load lesson content");
        return null;
      } finally {
        setIsLessonLoading(false);
      }
    },
    [enrollmentId]
  );

  
  const fetchQuizContent = useCallback(
    async (quizId) => {
      setIsLessonLoading(true);
      setContentType("quiz");
      setCurrentLesson(null);

      try {
        const response = await getQuizDetail(enrollmentId, quizId);

        if (!response.success) {
          toast.error(response.message || "Failed to load quiz");
          return null;
        }

        setCurrentQuiz(response.data);
        return response.data;
      } catch (err) {
        toast.error("Failed to load quiz content");
        return null;
      } finally {
        setIsLessonLoading(false);
      }
    },
    [enrollmentId]
  );

  return {
    currentLesson,
    currentQuiz,
    contentType,
    isLessonLoading,
    fetchLessonContent,
    fetchQuizContent
  };
}

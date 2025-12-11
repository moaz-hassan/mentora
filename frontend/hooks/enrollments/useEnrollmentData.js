"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getEnrollmentById } from "@/lib/apiCalls/enrollments/enrollment.service";

export function useEnrollmentData(enrollmentId) {
  const router = useRouter();
  
  
  const initialLoadComplete = useRef(false);

  
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState({
    completedLessons: [],
    completedChapters: [],
    completedQuizzes: [],
    quizScores: {},
    completionPercentage: 0,
    currentLessonId: null,
    currentChapterId: null,
  });

  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const [chatMembership, setChatMembership] = useState(null);

  
  const fetchEnrollment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getEnrollmentById(enrollmentId);

      if (!response.success) {
        setError(response.message || "Failed to load enrollment");
        if (response.message?.includes("not found") || response.message?.includes("access")) {
          toast.error("You don't have access to this course");
          router.push("/enrollments");
        }
        return null;
      }

      const data = response.data;
      
      setEnrollment(data);
      setCourse({...data.Course, User: data.User});
      setChapters(data.Course?.Chapters || []);
      setProgress(data.progress || {
        completedLessons: [],
        completedChapters: [],
        completedQuizzes: [],
        completionPercentage: 0,
      });
      
      
      setChatMembership(data.chatMembership || null);
      
      initialLoadComplete.current = true;
      return data;
    } catch (err) {
      setError("An error occurred while loading the course");
      toast.error("Failed to load course");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId, router]);

  return {
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
  };
}

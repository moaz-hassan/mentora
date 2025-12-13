import { useState, useEffect, useCallback } from "react";
import { getCourseForEdit } from "@/lib/apiCalls/courses/getCourseForEdit.apiCall";
import { toast } from "sonner";


export function useEditCourse(courseId) {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCourseForEdit(courseId);

      if (!response.success) {
        setError(response.message || "Failed to load course");
        return;
      }

      
      const transformedData = {
        ...response.data,
        thumbnail: response.data.thumbnail_url,
        introVideoUrl: response.data.intro_video_url,
        chapters: response.data.Chapters
          ?.sort((a, b) => (a.order_number || 0) - (b.order_number || 0))
          .map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.description || "",
            order_number: chapter.order_number,
            items: [
              ...(chapter.Lessons?.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.lesson_type,
                videoUrl: lesson.video_url,
                textContent: lesson.content,
                duration: lesson.duration,
                isPreview: lesson.is_preview,
                order_number: lesson.order_number,
              })) || []),
              ...(chapter.Quizzes?.map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                questions_length: quiz.questions_length || 0,
                order_number: quiz.order_number,
              })) || []),
            ].sort((a, b) => (a.order_number || 0) - (b.order_number || 0)),
          })) || [],
      };

      setCourseData(transformedData);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, fetchCourseData]);

  return {
    courseData,
    setCourseData,
    loading,
    error,
    refetch: fetchCourseData,
  };
}

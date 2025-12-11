import { useState, useCallback } from "react";
import { toast } from "sonner";
import uploadCourseContent from "@/lib/apiCalls/courses/uploadCourseContent";
import courseSaveDraftApiCall from "@/lib/apiCalls/courses/courseSaveDraft.apiCall";


export function useCreateCourse(clearDraft) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  
  const calculateStats = (data) => {
    const chapters = data?.chapters || [];
    let lessonsCount = 0;
    let quizzesCount = 0;

    chapters.forEach((chapter) => {
      if (chapter.items) {
        chapter.items.forEach((item) => {
          if (item.type === "lesson") lessonsCount++;
          if (item.type === "quiz") quizzesCount++;
        });
      }
    });

    return {
      chaptersCount: chapters.length,
      lessonsCount,
      quizzesCount,
    };
  };

  
  const saveDraft = useCallback(
    async (courseData) => {
      setIsUploading(true);
      setUploadProgress({ status: "uploading", message: "Saving as draft..." });

      try {
        const { courseId } = await uploadCourseContent(courseData, (progress) => {
          setUploadProgress(progress);
        });

        
        if (courseId) {
          try {
            await courseSaveDraftApiCall(courseId);
          } catch (error) {
            toast.error(error.message || "Failed to save course as draft");
          }
        }

        
        clearDraft();

        
        const stats = calculateStats(courseData);

        setUploadProgress({
          status: "success",
          message: "Course saved as draft successfully!",
          details: {
            courseTitle: courseData.title,
            chaptersCount: stats.chaptersCount,
            lessonsCount: stats.lessonsCount,
            quizzesCount: stats.quizzesCount,
            status: "Draft",
          },
        });
      } catch (error) {
        console.error("Upload error:", error);
        setUploadProgress({
          status: "error",
          message: error.message || "Upload failed",
        });

        setTimeout(() => {
          setIsUploading(false);
        }, 3000);
      }
    },
    [clearDraft]
  );

  
  const submitForReview = useCallback(
    async (courseData) => {
      setIsUploading(true);
      setUploadProgress({
        status: "uploading",
        message: "Submitting for review...",
      });

      try {
        const { courseId } = await uploadCourseContent(courseData, (progress) => {
          setUploadProgress(progress);
        });

        
        if (courseId) {
          const { submitCourseForReview } = await import(
            "@/lib/apiCalls/instructor/courses.apiCall"
          );
          const result = await submitCourseForReview(courseId);

          if (!result.success) {
            throw new Error(result.error || "Failed to submit for review");
          }
        }

        
        clearDraft();

        
        const stats = calculateStats(courseData);

        setUploadProgress({
          status: "success",
          message: "Course submitted for review successfully!",
          details: {
            courseTitle: courseData.title,
            chaptersCount: stats.chaptersCount,
            lessonsCount: stats.lessonsCount,
            quizzesCount: stats.quizzesCount,
            status: "Pending Review",
          },
        });
      } catch (error) {
        console.error("Upload error:", error);
        setUploadProgress({
          status: "error",
          message: error.message || "Upload failed",
        });

        setTimeout(() => {
          setIsUploading(false);
        }, 3000);
      }
    },
    [clearDraft]
  );

  return {
    isUploading,
    uploadProgress,
    saveDraft,
    submitForReview,
  };
}

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import uploadCourseContent from "@/lib/apiCalls/courses/uploadCourseContent";
import courseSaveDraftApiCall from "@/lib/apiCalls/courses/courseSaveDraft.apiCall";

/**
 * Custom hook for creating a course
 * @param {Function} clearDraft - Function to clear draft from store
 * @returns {Object} Course creation functions and state
 */
export function useCreateCourse(clearDraft) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  /**
   * Save course as draft
   */
  const saveDraft = useCallback(
    async (courseData, getCourseStats) => {
      setIsUploading(true);
      setUploadProgress({ status: "uploading", message: "Saving as draft..." });

      try {
        const { courseId } = await uploadCourseContent(courseData, (progress) => {
          setUploadProgress(progress);
        });

        // Save as draft
        if (courseId) {
          try {
            await courseSaveDraftApiCall(courseId);
          } catch (error) {
            toast.error(error.message || "Failed to save course as draft");
          }
        }

        // Clear store state
        clearDraft();

        // Get stats
        const stats = getCourseStats();

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

  /**
   * Submit course for review
   */
  const submitForReview = useCallback(
    async (courseData, getCourseStats) => {
      setIsUploading(true);
      setUploadProgress({
        status: "uploading",
        message: "Submitting for review...",
      });

      try {
        const { courseId } = await uploadCourseContent(courseData, (progress) => {
          setUploadProgress(progress);
        });

        // Submit for review
        if (courseId) {
          const { submitCourseForReview } = await import(
            "@/lib/apiCalls/instructor/courses.apiCall"
          );
          const result = await submitCourseForReview(courseId);

          if (!result.success) {
            throw new Error(result.error || "Failed to submit for review");
          }
        }

        // Clear store state
        clearDraft();

        // Get stats
        const stats = getCourseStats();

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

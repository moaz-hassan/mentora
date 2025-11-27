import { useState, useCallback } from "react";
import { updateCourseInfo } from "@/lib/apiCalls/courses/updateCourseInfo.apiCall";
import { saveAllCourseChanges } from "@/services/courseService";
import { toast } from "react-toastify";

/**
 * Custom hook for managing course updates
 * @param {string} courseId - The ID of the course being edited
 * @param {Function} uploadVideo - Video upload function from useVideoUpload
 * @param {Function} refetchCourse - Function to refetch course data
 * @returns {Object} Update functions and state
 */
export function useCourseUpdates(courseId, uploadVideo, refetchCourse) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Update general course information
   */
  const updateGeneralInfo = useCallback(
    async (courseData, updatedData) => {
      try {
        const response = await updateCourseInfo(courseId, {
          title: updatedData.title,
          subtitle: updatedData.subtitle,
          description: updatedData.description,
          category: updatedData.category,
          subcategory_id: updatedData.subcategory_id,
          level: updatedData.level,
          price: updatedData.price,
          learning_objectives: updatedData.learning_objectives,
          requirements: updatedData.requirements,
          target_audience: updatedData.target_audience,
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to update course");
        }

        toast.success("Course updated successfully!");
        return response.data;
      } catch (error) {
        console.error("Error updating course:", error);
        toast.error(error.message);
        throw error;
      }
    },
    [courseId]
  );

  /**
   * Save all course changes (chapters, lessons, quizzes)
   */
  const saveAllChanges = useCallback(
    async (courseData) => {
      if (!hasUnsavedChanges) {
        toast.info("No changes to save");
        return;
      }

      setIsSaving(true);

      try {
        await saveAllCourseChanges(courseId, courseData, uploadVideo);
        
        toast.success("All changes saved successfully!");
        setHasUnsavedChanges(false);

        // Refresh course data
        if (refetchCourse) {
          await refetchCourse();
        }
      } catch (error) {
        console.error("Error saving changes:", error);
        toast.error(error.message || "Failed to save changes");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [courseId, hasUnsavedChanges, uploadVideo, refetchCourse]
  );

  return {
    isSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    updateGeneralInfo,
    saveAllChanges,
  };
}

import { useState, useCallback } from "react";
import { updateCourseInfo } from "@/lib/apiCalls/courses/updateCourseInfo.apiCall";
import { saveAllCourseChanges } from "@/services/courseService";
import { toast } from "sonner";


export function useCourseUpdates(courseId, uploadVideo, refetchCourse) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  
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

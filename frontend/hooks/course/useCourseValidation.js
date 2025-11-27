import { useState, useCallback } from "react";
import { validateChapterRequirement, validateCourse } from "@/lib/validation/courseValidation";

/**
 * Custom hook for course validation
 * @param {Object} courseData - Course data to validate
 * @returns {Object} Validation functions and state
 */
export function useCourseValidation(courseData) {
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Check if course can be saved or submitted
   */
  const canSaveOrSubmit = useCallback(() => {
    const hasTitle = courseData?.title && courseData.title.trim() !== "";
    const hasDescription = courseData?.description && courseData.description.trim() !== "";
    const hasChapters = courseData?.chapters && courseData.chapters.length > 0;

    return hasTitle && hasDescription && hasChapters;
  }, [courseData]);

  /**
   * Validate chapter requirement
   */
  const validateChapters = useCallback(() => {
    const error = validateChapterRequirement(courseData?.chapters);
    if (error) {
      setValidationErrors({ chapters: error });
      return false;
    }
    return true;
  }, [courseData]);

  /**
   * Validate entire course
   */
  const validateFullCourse = useCallback(() => {
    const errors = validateCourse(courseData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [courseData]);

  /**
   * Get validation message for disabled buttons
   */
  const getValidationMessage = useCallback(() => {
    if (!courseData?.chapters || courseData.chapters.length === 0) {
      return "At least one chapter is required";
    }
    if (!courseData?.title) {
      return "Course title is required";
    }
    if (!courseData?.description) {
      return "Course description is required";
    }
    if (!courseData?.introVideoFile) {
      return "Please upload an introduction video to submit for review";
    }
    return "";
  }, [courseData]);

  return {
    validationErrors,
    canSaveOrSubmit: canSaveOrSubmit(),
    validateChapters,
    validateFullCourse,
    getValidationMessage: getValidationMessage(),
  };
}

import { useState, useCallback } from "react";
import { validateChapterRequirement, validateCourse } from "@/lib/validation/courseValidation";


export function useCourseValidation(courseData) {
  const [validationErrors, setValidationErrors] = useState({});

  
  const canSaveOrSubmit = useCallback(() => {
    const hasTitle = courseData?.title && courseData.title.trim() !== "";
    const hasDescription = courseData?.description && courseData.description.trim() !== "";
    const hasChapters = courseData?.chapters && courseData.chapters.length > 0;

    return hasTitle && hasDescription && hasChapters;
  }, [courseData]);

  
  const validateChapters = useCallback(() => {
    const error = validateChapterRequirement(courseData?.chapters);
    if (error) {
      setValidationErrors({ chapters: error });
      return false;
    }
    return true;
  }, [courseData]);

  
  const validateFullCourse = useCallback(() => {
    const errors = validateCourse(courseData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [courseData]);

  
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

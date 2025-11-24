import { useState, useEffect } from "react";

const STORAGE_KEY = "course_creation_draft";

export const DEFAULT_COURSE_DATA = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
  level: "beginner",
  price: "",
  discount: "",
  thumbnail: "",
  chapters: [],
};

/**
 * Get initial course data from localStorage
 * @returns {Object} Course data from localStorage or default data
 */
function getInitialCourseData() {
  if (typeof window === "undefined") {
    return DEFAULT_COURSE_DATA;
  }
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : DEFAULT_COURSE_DATA;
  } catch (error) {
    console.error("Failed to load course data from localStorage:", error);
    return DEFAULT_COURSE_DATA;
  }
}

/**
 * Custom hook for managing course creation data with localStorage persistence
 * @returns {Object} Object containing courseData, setCourseData, and handler functions
 */
export function useCourseStorage() {
  const [courseData, setCourseData] = useState(getInitialCourseData);

  // Save data to localStorage whenever courseData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courseData));
    } catch (error) {
      console.error("Failed to save course data to localStorage:", error);
    }
  }, [courseData]);

  /**
   * Handle save draft action
   */
  const handleSaveDraft = () => {
    alert("Course draft saved successfully!");
  };

  /**
   * Handle publish course action
   * Retrieves latest data from localStorage and prepares it for API call
   */
  const handlePublishCourse = async () => {
    if (!courseData.title) {
      alert("Please enter a course title");
      return;
    }

    try {
      // Get the latest course data from localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      const courseDataToPublish = savedData
        ? JSON.parse(savedData)
        : courseData;

      // Here you can send the data to your backend
      console.log("Publishing course with data:", courseDataToPublish);

      // Example API call:
      // const response = await fetch('/api/courses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(courseDataToPublish),
      // });
      // const result = await response.json();

      // If successful, clear the draft from localStorage
      // localStorage.removeItem(STORAGE_KEY);
      // alert("Course published successfully!");
      // Redirect to courses page or dashboard

      alert("Course published! (Check console for data)");
    } catch (error) {
      console.error("Failed to publish course:", error);
      alert("Failed to publish course. Please try again.");
    }
  };

  /**
   * Handle clear draft action
   * Removes draft from localStorage and resets state
   */
  const handleClearDraft = () => {
    if (
      confirm(
        "Are you sure you want to clear the draft? This cannot be undone."
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setCourseData(DEFAULT_COURSE_DATA);
      alert("Draft cleared successfully!");
    }
  };

  /**
   * Get current course data from localStorage
   * Useful for getting the latest data without relying on state
   */
  const getStoredCourseData = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : courseData;
  };

  /**
   * Clear all draft data
   */
  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    courseData,
    setCourseData,
    handleSaveDraft,
    handlePublishCourse,
    handleClearDraft,
    getStoredCourseData,
    clearStoredData,
  };
}

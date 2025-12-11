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


export function useCourseStorage() {
  const [courseData, setCourseData] = useState(getInitialCourseData);

  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courseData));
    } catch (error) {
      console.error("Failed to save course data to localStorage:", error);
    }
  }, [courseData]);

  
  const handleSaveDraft = () => {
    alert("Course draft saved successfully!");
  };

  
  const handlePublishCourse = async () => {
    if (!courseData.title) {
      alert("Please enter a course title");
      return;
    }

    try {
      
      const savedData = localStorage.getItem(STORAGE_KEY);
      const courseDataToPublish = savedData
        ? JSON.parse(savedData)
        : courseData;

      
      console.log("Publishing course with data:", courseDataToPublish);

      
      
      
      
      
      
      

      
      
      
      

      alert("Course published! (Check console for data)");
    } catch (error) {
      console.error("Failed to publish course:", error);
      alert("Failed to publish course. Please try again.");
    }
  };

  
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

  
  const getStoredCourseData = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : courseData;
  };

  
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

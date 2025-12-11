import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";


const useCourseStore = create(
  devtools(
    persist(
      (set, get) => ({
        
        DEFAULT_COURSE_DATA: {
          title: "",
          description: "",
          price: 0,
          discountedPrice: 0,
          category: "",
          level: "beginner",
          language: "English",
          thumbnail: "",
          chapters: [],
          duration: 0,
          lastUpdated: new Date().toISOString(),
        },

        
        courseData: null,

        
        initializeCourse: () => {
          const stored = localStorage.getItem("course_creation_draft");
          if (stored) {
            set({ courseData: JSON.parse(stored) });
          } else {
            set({
              courseData: {
                title: "",
                description: "",
                price: 0,
                discountedPrice: 0,
                category: "",
                level: "beginner",
                language: "English",
                thumbnail: "",
                chapters: [],
                duration: 0,
                lastUpdated: new Date().toISOString(),
              },
            });
          }
        },

        
        updateCourseData: (updatedData) => {
          set((state) => {
            const newData = {
              ...state.courseData,
              ...updatedData,
              lastUpdated: new Date().toISOString(),
            };
            
            localStorage.setItem(
              "course_creation_draft",
              JSON.stringify(newData)
            );
            return { courseData: newData };
          });
        },

        
        setCourseData: (data) => {
          set({
            courseData: {
              ...data,
              lastUpdated: new Date().toISOString(),
            },
          });
          localStorage.setItem(
            "course_creation_draft",
            JSON.stringify({
              ...data,
              lastUpdated: new Date().toISOString(),
            })
          );
        },

        
        saveDraft: async () => {
          const state = get();
          try {
            localStorage.setItem(
              "course_creation_draft",
              JSON.stringify(state.courseData)
            );
            return {
              success: true,
              message: "Draft saved successfully!",
            };
          } catch (error) {
            console.error("Error saving draft:", error);
            return {
              success: false,
              message: "Failed to save draft. Please try again.",
              error,
            };
          }
        },

        
        publishCourse: async () => {
          const state = get();
          const courseData = state.courseData;

          
          if (!courseData.title) {
            return {
              success: false,
              message: "Course title is required",
            };
          }

          try {
            
            const response = await fetch("/api/courses", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify(courseData),
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();

            
            get().clearDraft();

            return {
              success: true,
              message: "Course published successfully!",
              data: result,
            };
          } catch (error) {
            console.error("Error publishing course:", error);
            return {
              success: false,
              message: "Failed to publish course. Please try again.",
              error: error.message,
            };
          }
        },

      
        clearDraft: () => {
          localStorage.removeItem("course_creation_draft");
          set({
            courseData: {
              title: "",
              description: "",
              price: 0,
              discountedPrice: 0,
              category: "",
              level: "beginner",
              language: "English",
              thumbnail: "",
              chapters: [],
              duration: 0,
              lastUpdated: new Date().toISOString(),
            },
          });
          return true;
        },

        getStoredCourseData: () => {
          const stored = localStorage.getItem("course_creation_draft");
          return stored ? JSON.parse(stored) : null;
        },
        clearStoredData: () => {
          localStorage.removeItem("course_creation_draft");
          set({
            courseData: {
              title: "",
              description: "",
              price: 0,
              discountedPrice: 0,
              category: "",
              level: "beginner",
              language: "English",
              thumbnail: "",
              chapters: [],
              duration: 0,
              lastUpdated: new Date().toISOString(),
            },
          });
        },
      }),
      {
        name: "course-store", 
        partialize: (state) => ({
          courseData: state.courseData, 
        }),
      }
    ),
    { name: "CourseStore" }
  )
);

export default useCourseStore;

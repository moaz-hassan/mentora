import axios from "axios";

export const getCourseForEdit = async (courseId) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );    

    if (!response.data.success) {
      const errorData = response.data;
      throw new Error(errorData.message || "Failed to fetch course data");
    }

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching course for edit:", error);
    throw error;
  }
};

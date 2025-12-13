import axios from "axios";
import { getAuthToken } from "@/lib/utils/apiHelpers";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api`;

/**
 * Delete a course (only works for draft/rejected courses with no enrollments)
 */
export const deleteCourse = async (courseId) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(
      `${API_URL}/instructor/courses/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete course"
    );
  }
};

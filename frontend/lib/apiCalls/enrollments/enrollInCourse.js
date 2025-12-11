import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Enroll in a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with enrollment data
 */
const enrollInCourse = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/enrollments`,
      { course_id: courseId }, // Backend expects course_id
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default enrollInCourse;

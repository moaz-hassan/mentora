import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get course data for editing
 * @param {string|number} courseId - Course ID
 * @returns {Promise<Object>} Response with success flag and course data
 * 
 * @example
 * const result = await getCourseForEdit(123);
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export const getCourseForEdit = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

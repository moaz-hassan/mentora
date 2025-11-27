import axios from "axios";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get related courses by category
 * @param {string|number} courseId - Current course ID
 * @param {string} category - Course category (optional, will be fetched from course)
 * @param {number} limit - Maximum number of related courses (default: 4)
 * @returns {Promise<Object>} Response with success flag and related courses array
 * 
 * @example
 * const result = await getRelatedCourses(123, 'Web Development', 4);
 * if (result.success) {
 *   console.log(result.data); // Array of related courses
 * }
 */
export default async function getRelatedCourses(courseId, category = null, limit = 4) {
  try {
    const response = await axios.get(`${API_URL}/api/courses/${courseId}/related`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

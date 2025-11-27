import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Update course general information
 * @param {string|number} courseId - The course ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Response with success flag and updated course data
 * 
 * @example
 * const result = await updateCourseInfo(123, { title: 'New Title' });
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export const updateCourseInfo = async (courseId, updateData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/api/courses/${courseId}`,
      updateData,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

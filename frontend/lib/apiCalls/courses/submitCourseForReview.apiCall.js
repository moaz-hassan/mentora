import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Submit course for review
 * @param {string|number} courseId - Course ID
 * @returns {Promise<Object>} Response with success flag and data
 * 
 * @example
 * const result = await submitForReview(123);
 * if (result.success) {
 *   console.log('Course submitted for review');
 * }
 */
export const submitForReview = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/courses/${courseId}/submit-review`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

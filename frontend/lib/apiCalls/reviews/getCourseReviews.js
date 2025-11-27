import axios from 'axios';
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;

/**
 * Get course reviews
 * @param {string|number} courseId - Course ID
 * @returns {Promise<Object>} Response with success flag and reviews array
 * 
 * @example
 * const result = await getCourseReviews(123);
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export const getCourseReviews = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/course/${courseId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

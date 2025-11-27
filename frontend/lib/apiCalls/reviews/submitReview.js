import axios from 'axios';
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;

/**
 * Submit a course review
 * @param {Object} reviewData - Review data
 * @param {string|number} reviewData.course_id - Course ID
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.review_text - Review text
 * @returns {Promise<Object>} Response with success flag and created review
 * 
 * @example
 * const result = await submitReview({
 *   course_id: 123,
 *   rating: 5,
 *   review_text: 'Great course!'
 * });
 * if (result.success) {
 *   console.log('Review submitted');
 * }
 */
export const submitReview = async (reviewData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/reviews`, reviewData, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default submitReview;

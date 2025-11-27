import axios from "axios";
import { 
  getAuthToken,
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Save course as draft
 * @param {string|number} courseId - Course ID
 * @returns {Promise<Object>} Response with success flag and data
 * 
 * @example
 * const result = await courseSaveDraftApiCall(123);
 * if (result.success) {
 *   console.log('Course saved as draft');
 * }
 */
export default async function courseSaveDraftApiCall(courseId) {
  try {
    const headers = getAuthHeaders();
    
    if (!getAuthToken()) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const response = await axios.post(
      `${API_URL}/api/courses/${courseId}/save-draft`,
      {},
      { headers }
    );
    
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

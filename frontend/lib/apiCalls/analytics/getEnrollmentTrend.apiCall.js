import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get enrollment trend for instructor
 * @param {number} days - Number of days to look back (default: 30)
 * @param {string} groupBy - Grouping method: 'day', 'week', or 'month' (default: 'day')
 * @returns {Promise<Object>} Response with success flag and enrollment trend data
 * 
 * @example
 * const result = await getEnrollmentTrend(30, 'day');
 * if (result.success) {
 *   console.log(result.data.enrollments);
 * }
 */
export const getEnrollmentTrend = async (days = 30, groupBy = 'day') => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("days", days.toString());
    params.append("groupBy", groupBy);

    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/api/instructor/analytics/enrollments?${params.toString()}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get revenue analytics for instructor
 * @param {string|null} startDate - Start date for filtering (ISO format)
 * @param {string|null} endDate - End date for filtering (ISO format)
 * @returns {Promise<Object>} Response with success flag and revenue analytics data
 * 
 * @example
 * const result = await getRevenueAnalytics('2024-01-01', '2024-12-31');
 * if (result.success) {
 *   console.log(result.data.revenue_by_month);
 * }
 */
export const getRevenueAnalytics = async (startDate = null, endDate = null) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate);
    }
    if (endDate) {
      params.append("endDate", endDate);
    }

    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/api/instructor/analytics/revenue${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      { headers }
    );

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

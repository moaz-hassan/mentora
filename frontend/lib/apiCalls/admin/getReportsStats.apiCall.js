/**
 * Get reports statistics for admin dashboard
 */

import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Fetch reports statistics
 * @returns {Promise<Object>} Response with reports stats (pending, resolved, etc.)
 * 
 * @example
 * const result = await getReportsStats();
 * if (result.success) {
 *   console.log(result.data.stats.pending);
 *   console.log(result.data.stats.resolved);
 * }
 */
export default async function getReportsStats() {
  try {
    const headers = getAuthHeaders();
    
    const response = await axios.get(`${API_URL}/api/reports/stats`, {
      headers,
    });
    
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

/**
 * Get users list for admin management
 */

import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Fetch users list with optional pagination and filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search query
 * @param {string} options.role - Filter by role
 * @returns {Promise<Object>} Response with users list and pagination
 * 
 * @example
 * const result = await getUsers({ page: 1, limit: 10, role: 'student' });
 * if (result.success) {
 *   console.log(result.data.users);
 *   console.log(result.data.pagination);
 * }
 */
export default async function getUsers(options = {}) {
  try {
    const headers = getAuthHeaders();
    
    const response = await axios.get(`${API_URL}/api/users`, {
      headers,
      params: options,
    });
    
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

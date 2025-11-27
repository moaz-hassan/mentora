import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get all users (admin only)
 * @returns {Promise<Object>} Response with users list
 * 
 * @example
 * const result = await getAllUsers();
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export const getAllUsers = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Update user role (admin only)
 * @param {string} userId - User ID
 * @param {string} newRole - New role (student, instructor, admin)
 * @returns {Promise<Object>} Response with success status
 * 
 * @example
 * const result = await updateUserRole('user123', 'instructor');
 * if (result.success) {
 *   console.log('Role updated');
 * }
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/api/users/${userId}`,
      { role: newRole },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Toggle user status (active/inactive) (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response with success status
 * 
 * @example
 * const result = await toggleUserStatus('user123');
 * if (result.success) {
 *   console.log(result.message);
 * }
 */
export const toggleUserStatus = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch(
      `${API_URL}/api/admin/users/${userId}/status`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

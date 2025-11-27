import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get user profile
 * @returns {Promise<Object>} Response with profile data
 * 
 * @example
 * const result = await getUserProfile();
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export const getUserProfile = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users/profile`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Response with success status
 * 
 * @example
 * const result = await updateUserProfile({ first_name: 'John', last_name: 'Doe' });
 * if (result.success) {
 *   console.log('Profile updated');
 * }
 */
export const updateUserProfile = async (profileData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/api/users/profile`,
      profileData,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get notification preferences
 * @returns {Promise<Object>} Response with notification preferences
 */
export const getNotificationPreferences = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users/notification-preferences`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Update notification preferences
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} Response with success status
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/api/users/notification-preferences`,
      preferences,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>} Response with success status
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/users/change-password`,
      { currentPassword, newPassword, confirmPassword },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

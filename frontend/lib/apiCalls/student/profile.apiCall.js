import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getUserProfile = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users/profile`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


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


export const getNotificationPreferences = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users/notification-preferences`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


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

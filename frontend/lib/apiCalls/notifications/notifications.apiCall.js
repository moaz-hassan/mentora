import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getNotifications = async (page = 1, limit = 10) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/api/notifications?page=${page}&limit=${limit}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch(
      `${API_URL}/api/notifications/${notificationId}`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const markAllNotificationsAsRead = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/notifications/mark-all-read`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const deleteNotification = async (notificationId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(
      `${API_URL}/api/notifications/${notificationId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

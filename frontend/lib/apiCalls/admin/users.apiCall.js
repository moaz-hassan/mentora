import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getAllUsers = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


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

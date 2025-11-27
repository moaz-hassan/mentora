import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

export const instructorsAPI = {
  getAll: async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/admin/instructors`, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  getById: async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/admin/instructors/${id}`, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  getAnalytics: async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/admin/instructors/${id}/analytics`, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },
  updateStatus: async (id, status) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.patch(
        `${API_URL}/api/admin/instructors/${id}/status`,
        { status },
        { headers }
      );
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  }
};

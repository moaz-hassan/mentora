import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

export const settingsAPI = {
  
  getAll: async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/admin/settings`, { headers });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  },

  
  bulkUpdate: async (settings) => {
    try {
      const headers = getAuthHeaders();
      
      
      const updates = [];
      Object.entries(settings).forEach(([category, values]) => {
        Object.entries(values).forEach(([key, value]) => {
          updates.push({ key, value, category });
        });
      });

      const response = await axios.post(
        `${API_URL}/api/admin/settings/bulk`, 
        { updates }, 
        { headers }
      );
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message };
    }
  }
};

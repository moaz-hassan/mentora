import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getRevenueAnalytics = async (startDate = null, endDate = null) => {
  try {
    
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

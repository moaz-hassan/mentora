import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getEnrollmentTrend = async (days = 30, groupBy = 'day') => {
  try {
    
    const params = new URLSearchParams();
    params.append("days", days.toString());
    params.append("groupBy", groupBy);

    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/api/instructor/analytics/enrollments?${params.toString()}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

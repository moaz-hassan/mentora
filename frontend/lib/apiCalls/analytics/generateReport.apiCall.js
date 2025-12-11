import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const generateReport = async (options = {}) => {
  try {
    const {
      startDate = null,
      endDate = null,
      courseIds = null,
      anonymizeStudents = true,
    } = options;

    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/instructor/analytics/report`,
      {
        startDate,
        endDate,
        courseIds,
        anonymizeStudents,
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

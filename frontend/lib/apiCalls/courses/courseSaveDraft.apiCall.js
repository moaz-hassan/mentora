import axios from "axios";
import { 
  getAuthToken,
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function courseSaveDraftApiCall(courseId) {
  try {
    const headers = getAuthHeaders();
    
    if (!getAuthToken()) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const response = await axios.post(
      `${API_URL}/api/courses/${courseId}/save-draft`,
      {},
      { headers }
    );
    
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

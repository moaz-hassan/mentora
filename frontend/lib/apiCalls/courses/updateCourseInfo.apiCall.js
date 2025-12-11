import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const updateCourseInfo = async (courseId, updateData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/api/courses/${courseId}`,
      updateData,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

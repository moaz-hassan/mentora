import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getInstructorAnalytics = async (courseId = null, days = 30) => {
  try {
    const headers = getAuthHeaders();
    
    // Build query parameters
    const params = {};
    if (courseId) {
      params.courseId = courseId;
    }
    params.days = days;

    // Backend route is /api/instructor/ (not /api/instructor/analytics)
    const response = await axios.get(`${API_URL}/api/instructor/analytics`, {
      headers,
      params,
    });

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const exportInstructorAnalytics = async (courseId = null, days = 30) => {
  try {
    const headers = getAuthHeaders();
    
    // Build query parameters
    const params = {};
    if (courseId) {
      params.courseId = courseId;
    }
    params.days = days;

    // Backend route is /api/instructor/export (not /api/instructor/analytics/export)
    const response = await axios.get(`${API_URL}/api/instructor/analytics/export`, {
      headers,
      params,
    });

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }

}
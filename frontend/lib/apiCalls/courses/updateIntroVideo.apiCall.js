import axios from 'axios';
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;

export const updateCourseIntroVideo = async (courseId, videoData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/courses/${courseId}/intro-video`,
      videoData,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

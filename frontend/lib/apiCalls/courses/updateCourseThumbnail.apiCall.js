import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const updateCourseThumbnail = async (courseId, thumbnailFile) => {
  try {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/api/courses/${courseId}/thumbnail`,
      formData,
      { 
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

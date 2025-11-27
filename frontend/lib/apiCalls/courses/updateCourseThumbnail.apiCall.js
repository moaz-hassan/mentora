import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Update course thumbnail
 * @param {string|number} courseId - The course ID
 * @param {File} thumbnailFile - The thumbnail file to upload
 * @returns {Promise<Object>} Response with success flag and updated course data
 * 
 * @example
 * const result = await updateCourseThumbnail(123, thumbnailFile);
 * if (result.success) {
 *   console.log('Thumbnail updated');
 * }
 */
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

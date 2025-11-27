import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Initiate a private chat with an instructor
 * @param {string|number} instructorId - The instructor's user ID
 * @param {string|number|null} courseId - The course ID (optional, for context)
 * @returns {Promise<Object>} Response with success flag and chat room data
 * 
 * @example
 * const result = await initiatePrivateChat(123, 456);
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export async function initiatePrivateChat(instructorId, courseId = null) {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/chat/private`,
      {
        participant_id: instructorId,
        course_id: courseId,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

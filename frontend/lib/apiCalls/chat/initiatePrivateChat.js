import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


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

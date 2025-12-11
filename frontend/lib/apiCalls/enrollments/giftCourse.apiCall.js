import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const giftCourse = async (courseId, recipientEmail, personalMessage = "") => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/enrollments/gift`,
      { courseId, recipientEmail, personalMessage },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

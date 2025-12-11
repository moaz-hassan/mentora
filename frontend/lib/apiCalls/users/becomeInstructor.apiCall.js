import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const becomeInstructor = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/users/become-instructor`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

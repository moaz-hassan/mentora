import axios from "axios";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function getInstructorStats(instructorId) {
  try {
    const response = await axios.get(`${API_URL}/api/instructor/${instructorId}/stats`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

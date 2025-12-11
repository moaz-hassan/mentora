import axios from "axios";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function getRelatedCourses(courseId, category = null, limit = 4) {
  try {
    const response = await axios.get(`${API_URL}/api/courses/${courseId}/related`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

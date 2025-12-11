import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function getCourseById(courseId) {
  try {
    const response = await axios.get(`${API_URL}/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

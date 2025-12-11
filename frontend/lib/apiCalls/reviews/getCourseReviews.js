import axios from 'axios';
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;


export const getCourseReviews = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/course/${courseId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

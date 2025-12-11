import axios from 'axios';
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;


export const submitReview = async (reviewData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/reviews`, reviewData, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default submitReview;

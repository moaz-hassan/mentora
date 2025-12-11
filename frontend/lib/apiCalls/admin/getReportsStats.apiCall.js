

import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function getReportsStats() {
  try {
    const headers = getAuthHeaders();
    
    const response = await axios.get(`${API_URL}/api/reports/stats`, {
      headers,
    });
    
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

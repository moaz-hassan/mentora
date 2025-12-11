

import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function getUsers(options = {}) {
  try {
    const headers = getAuthHeaders();
    
    const response = await axios.get(`${API_URL}/api/users`, {
      headers,
      params: options,
    });
    
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

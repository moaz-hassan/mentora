import axios from 'axios';
import { 
  getAuthToken,
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;


export const checkEnrollment = async (courseId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return false;
    }
    
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/check/${courseId}`,
      { headers }
    );
    
    return response.data?.isEnrolled || false;
  } catch (error) {
    
    console.error('Error checking enrollment:', error);
    return false;
  }
};

export default checkEnrollment;

import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function getUserEnrollments() {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/enrollments`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}


export const getEnrollmentById = async (enrollmentId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/enrollments/${enrollmentId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const createEnrollment = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/enrollments`,
      { courseId },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get user enrollments
 * @returns {Promise<Object>} Response with enrollments list
 * 
 * @example
 * const result = await getUserEnrollments();
 * if (result.success) {
 *   console.log(result.data);
 * }
 */
export default async function getUserEnrollments() {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/enrollments`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

/**
 * Get enrollment by ID
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Promise<Object>} Response with enrollment details
 */
export const getEnrollmentById = async (enrollmentId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/enrollments/${enrollmentId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Create new enrollment
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with enrollment data
 */
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

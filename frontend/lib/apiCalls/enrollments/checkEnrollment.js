import axios from 'axios';
import { 
  getAuthToken,
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;

/**
 * Check if current user is enrolled in a course
 * @param {string|number} courseId - Course ID
 * @returns {Promise<boolean>} - Enrollment status
 * 
 * @example
 * const isEnrolled = await checkEnrollment(123);
 * if (isEnrolled) {
 *   console.log('User is enrolled');
 * }
 */
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
    // If error (like 401), assume not enrolled
    console.error('Error checking enrollment:', error);
    return false;
  }
};

export default checkEnrollment;

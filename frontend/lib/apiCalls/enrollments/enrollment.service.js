import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Verify enrollment access for course player
 * @param {string|number} enrollmentId - Enrollment ID
 * @param {string|number} courseId - Course ID
 * @returns {Promise<Object>} Response with success flag and access data
 */
export const verifyEnrollmentAccess = async (enrollmentId, courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/course/${courseId}/access`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get course player data with full content
 * @param {string|number} enrollmentId - Enrollment ID
 * @param {string|number} courseId - Course ID
 * @returns {Promise<Object>} Response with success flag and player data
 */
export const getCoursePlayerData = async (enrollmentId, courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/course/${courseId}/player`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get student progress
 * @param {string|number} enrollmentId - Enrollment ID
 * @returns {Promise<Object>} Response with success flag and progress data
 */
export const getProgress = async (enrollmentId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/progress`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Update student progress
 * @param {string|number} enrollmentId - Enrollment ID
 * @param {Object} progressData - Progress data to update
 * @returns {Promise<Object>} Response with success flag and updated progress
 */
export const updateProgress = async (enrollmentId, progressData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/enrollments/${enrollmentId}/progress`,
      progressData,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get all enrollments for a student
 * @returns {Promise<Object>} Response with success flag and enrollments array
 */
export const getMyEnrollments = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/enrollments`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

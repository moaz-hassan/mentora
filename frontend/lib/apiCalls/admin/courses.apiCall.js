import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get all courses with optional filters (admin)
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @returns {Promise<Object>} Response with courses list
 */
export const getAdminCourses = async (filters = {}) => {
  try {
    const headers = getAuthHeaders();
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = filters.status 
      ? `${API_URL}/api/admin/courses?${params}`
      : `${API_URL}/api/courses?${params}`;
    
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get pending courses for review (admin)
 * @returns {Promise<Object>} Response with pending courses
 */
export const getPendingCourses = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/courses/pending`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Approve a course (admin)
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with success status
 */
export const approveCourse = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/admin/courses/${courseId}/approve`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Reject a course (admin)
 * @param {string} courseId - Course ID
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Object>} Response with success status
 */
export const rejectCourse = async (courseId, rejectionReason) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/admin/courses/${courseId}/reject`,
      { rejection_reason: rejectionReason },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Delete a course (admin)
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with success status
 */
export const deleteCourse = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/api/courses/${courseId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Analyze course with AI (admin)
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with AI analysis
 */
export const analyzeCourseWithAI = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/admin/courses/${courseId}/analyze`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get course details (admin)
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with course details
 */
export const getCourseDetails = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/courses/${courseId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

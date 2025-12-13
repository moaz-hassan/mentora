import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


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


export const getPendingCourses = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/courses/pending`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


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


export const deleteCourse = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/api/courses/${courseId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


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


export const getCourseDetails = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/courses/${courseId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const toggleFeatured = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch(
      `${API_URL}/api/admin/courses/${courseId}/featured`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

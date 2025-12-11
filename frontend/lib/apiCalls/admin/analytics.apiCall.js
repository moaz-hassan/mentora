import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getPlatformOverview = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/analytics/overview`, { 
      headers,
      params 
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getAdminRevenueAnalytics = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/analytics/revenue`, { 
      headers,
      params 
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getUserGrowthAnalytics = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/analytics/users`, { 
      headers,
      params 
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getEnrollmentAnalytics = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/analytics/enrollments`, { 
      headers,
      params 
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getCoursePerformanceAnalytics = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/analytics/courses`, { 
      headers,
      params 
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const exportAnalyticsData = async (data = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/analytics/export`, data, { 
      headers 
    });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

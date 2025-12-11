import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getAnalytics = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/logs/analytics`, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching logs analytics:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch analytics",
    };
  }
};


export const getAudit = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/logs/audit`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch audit logs",
    };
  }
};


export const getPayments = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/logs/payments`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching payment logs:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch payment logs",
    };
  }
};


export const getEnrollments = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/logs/enrollments`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching enrollment logs:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch enrollment logs",
    };
  }
};


export const getErrors = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/logs/errors`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch error logs",
    };
  }
};


export const search = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/logs/search`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error searching logs:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to search logs",
    };
  }
};


export const exportData = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/logs/export`, params, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error exporting logs:", error);
    throw new Error(error.response?.data?.message || "Failed to export logs");
  }
};


export { exportData as export };


export const clearOldLogs = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/logs/clear`, params, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error clearing logs:", error);
    throw new Error(error.response?.data?.message || "Failed to clear logs");
  }
};

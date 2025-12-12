import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getStatistics = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/notifications/statistics`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching notification statistics:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch statistics",
    };
  }
};


export const getHistory = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/notifications/history`, { 
      headers,
      params 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch history",
    };
  }
};


export const getScheduled = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/notifications/scheduled`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching scheduled notifications:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch scheduled notifications",
    };
  }
};


export const broadcast = async (notificationData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/notifications/broadcast`, notificationData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    throw new Error(error.response?.data?.message || "Failed to send notification");
  }
};


export const sendScheduled = async (notificationId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/notifications/scheduled/${notificationId}/send`, {}, { headers });
    return response.data;
  } catch (error) {
    console.error("Error sending scheduled notification:", error);
    throw new Error(error.response?.data?.message || "Failed to send notification");
  }
};


export const cancelScheduled = async (notificationId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/api/admin/notifications/scheduled/${notificationId}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error cancelling scheduled notification:", error);
    throw new Error(error.response?.data?.message || "Failed to cancel notification");
  }
};


export const getTemplates = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/notifications/templates`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching notification templates:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch templates",
    };
  }
};


export const createTemplate = async (templateData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/notifications/templates`, templateData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating template:", error);
    throw new Error(error.response?.data?.message || "Failed to create template");
  }
};


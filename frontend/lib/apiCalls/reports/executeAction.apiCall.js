import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Execute an action on a report
 * @param {string} reportId - Report ID
 * @param {string} actionType - Action to execute
 * @returns {Promise<object>} Action result
 */
export default async function executeAction(reportId, actionType) {
  try {
    const response = await apiClient.post(`/api/reports/${reportId}/execute`, { actionType });
    return response;
  } catch (error) {
    throw error;
  }
}

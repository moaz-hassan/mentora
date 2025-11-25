import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
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

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Report Service API calls
export const reportService = {
  /**
   * Create a new report
   * @param {object} reportData - Report data (title, description, contentReference, contentType)
   * @returns {Promise<object>} Created report
   */
  async createReport(reportData) {
    try {
      const response = await apiClient.post("/api/reports", reportData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all reports with optional filters
   * @param {object} filters - Filter options (status, type, dateRange)
   * @returns {Promise<object>} List of reports
   */
  async getReports(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.search) params.append("search", filters.search);

      const response = await apiClient.get(`/api/reports?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single report by ID
   * @param {string} reportId - Report ID
   * @returns {Promise<object>} Report details
   */
  async getReportById(reportId) {
    try {
      const response = await apiClient.get(`/api/reports/${reportId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update report status
   * @param {string} reportId - Report ID
   * @param {string} status - New status
   * @returns {Promise<object>} Updated report
   */
  async updateReportStatus(reportId, status) {
    try {
      const response = await apiClient.patch(`/api/reports/${reportId}`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get AI-powered action recommendations for a report
   * @param {string} reportId - Report ID
   * @returns {Promise<object>} AI recommendations
   */
  async getActionRecommendations(reportId) {
    try {
      const response = await apiClient.get(`/api/reports/${reportId}/recommendations`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Execute an action on a report
   * @param {string} reportId - Report ID
   * @param {string} actionType - Action to execute
   * @returns {Promise<object>} Action result
   */
  async executeAction(reportId, actionType) {
    try {
      const response = await apiClient.post(`/api/reports/${reportId}/execute`, { actionType });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get AI summary for a report
   * @param {string} reportId - Report ID
   * @returns {Promise<object>} AI summary
   */
  async getAISummary(reportId) {
    try {
      const response = await apiClient.get(`/api/reports/${reportId}/summary`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default reportService;

import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get all reports with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status
 * @param {string} filters.type - Filter by type
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @returns {Promise<Object>} Response with reports list
 */
export const getReports = async (filters = {}) => {
  try {
    const headers = getAuthHeaders();
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await axios.get(`${API_URL}/api/reports?${params}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get reports statistics
 * @returns {Promise<Object>} Response with stats
 */
export const getReportsStats = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/reports/stats`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get single report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Response with report details
 */
export const getReportById = async (reportId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/reports/${reportId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Update report status
 * @param {string} reportId - Report ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Response with success status
 */
export const updateReportStatus = async (reportId, status) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch(
      `${API_URL}/api/reports/${reportId}/status`,
      { status },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Add notes to a report
 * @param {string} reportId - Report ID
 * @param {string} notes - Notes to add
 * @returns {Promise<Object>} Response with success status
 */
export const addReportNotes = async (reportId, notes) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/reports/${reportId}/notes`,
      { notes },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Resolve a report
 * @param {string} reportId - Report ID
 * @param {string} resolution - Resolution notes
 * @returns {Promise<Object>} Response with success status
 */
export const resolveReport = async (reportId, resolution) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/reports/${reportId}/resolve`,
      { resolution },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get AI summary for a report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Response with AI summary
 */
export const getReportAISummary = async (reportId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/reports/${reportId}/ai-summary`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

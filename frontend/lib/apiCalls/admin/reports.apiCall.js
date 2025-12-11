import axios from "axios";
import { 
  getAuthHeaders, 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


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


export const getReportsStats = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/reports/stats`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getReportById = async (reportId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/reports/${reportId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


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


export const getReportAISummary = async (reportId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/reports/${reportId}/ai-summary`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

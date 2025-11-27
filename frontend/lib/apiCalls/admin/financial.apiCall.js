import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get financial overview
 */
export const getOverview = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/financial/overview`, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching financial overview:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch overview",
    };
  }
};

/**
 * Get revenue data
 */
export const getRevenue = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/financial/revenue`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch revenue",
    };
  }
};

/**
 * Get payouts data
 */
export const getPayouts = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/financial/payouts`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch payouts",
    };
  }
};

/**
 * Get transactions data
 */
export const getTransactions = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/financial/transactions`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch transactions",
    };
  }
};

/**
 * Process a payout
 */
export const processPayout = async (payoutId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/financial/payouts/${payoutId}/process`, {}, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error processing payout:", error);
    throw new Error(error.response?.data?.message || "Failed to process payout");
  }
};

/**
 * Export financial data
 */
export const exportData = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/financial/export`, params, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error exporting financial data:", error);
    throw new Error(error.response?.data?.message || "Failed to export data");
  }
};

// Alias for compatibility (export is a reserved keyword)
export { exportData as export };

/**
 * Get refunds data
 */
export const getRefunds = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/admin/financial/refunds`, { 
      headers,
      params 
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch refunds",
    };
  }
};

/**
 * Process a refund
 */
export const processRefund = async (refundData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/admin/financial/refunds`, refundData, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    throw new Error(error.response?.data?.message || "Failed to process refund");
  }
};

import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "../../../lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();
const createReport = async (reportData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/reports`,
      reportData,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export default createReport;

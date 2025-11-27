import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Generate comprehensive analytics report
 * @param {Object} options - Report generation options
 * @param {string|null} options.startDate - Start date for filtering (ISO format)
 * @param {string|null} options.endDate - End date for filtering (ISO format)
 * @param {string[]|null} options.courseIds - Array of course IDs to include (null for all)
 * @param {boolean} options.anonymizeStudents - Whether to anonymize student data (default: true)
 * @returns {Promise<Object>} Response with success flag and report data
 * 
 * @example
 * const result = await generateReport({
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31',
 *   courseIds: [123, 456],
 *   anonymizeStudents: true
 * });
 */
export const generateReport = async (options = {}) => {
  try {
    const {
      startDate = null,
      endDate = null,
      courseIds = null,
      anonymizeStudents = true,
    } = options;

    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/instructor/analytics/report`,
      {
        startDate,
        endDate,
        courseIds,
        anonymizeStudents,
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

import axios from "axios";
import Cookies from "js-cookie";

/**
 * Generate comprehensive analytics report
 * @param {Object} options - Report generation options
 * @param {string|null} options.startDate - Start date for filtering (ISO format)
 * @param {string|null} options.endDate - End date for filtering (ISO format)
 * @param {string[]|null} options.courseIds - Array of course IDs to include (null for all)
 * @param {boolean} options.anonymizeStudents - Whether to anonymize student data (default: true)
 * @returns {Promise} Comprehensive report data
 */
export const generateReport = async (options = {}) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  const {
    startDate = null,
    endDate = null,
    courseIds = null,
    anonymizeStudents = true,
  } = options;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/analytics/report`,
      {
        startDate,
        endDate,
        courseIds,
        anonymizeStudents,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

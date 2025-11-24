import axios from "axios";
import Cookies from "js-cookie";

/**
 * Get instructor analytics
 * @param {string|null} courseId - Optional course ID for specific course analytics
 * @param {number} days - Number of days for time-based metrics (default: 30)
 * @returns {Promise} Analytics data
 */
export const getInstructorAnalytics = async (courseId = null, days = 30) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (courseId) {
      params.append("courseId", courseId);
    }
    params.append("days", days.toString());

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/analytics?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};

/**
 * Export instructor analytics data
 * @param {string|null} courseId - Optional course ID for specific course analytics
 * @param {number} days - Number of days for time-based metrics (default: 30)
 * @returns {Promise} Export data
 */
export const exportInstructorAnalytics = async (courseId = null, days = 30) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (courseId) {
      params.append("courseId", courseId);
    }
    params.append("days", days.toString());

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/analytics/export?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error exporting analytics:", error);
    throw error;
  }
};

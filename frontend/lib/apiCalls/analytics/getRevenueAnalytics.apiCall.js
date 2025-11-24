import axios from "axios";
import Cookies from "js-cookie";

/**
 * Get revenue analytics for instructor
 * @param {string|null} startDate - Start date for filtering (ISO format)
 * @param {string|null} endDate - End date for filtering (ISO format)
 * @returns {Promise} Revenue analytics data
 */
export const getRevenueAnalytics = async (startDate = null, endDate = null) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate);
    }
    if (endDate) {
      params.append("endDate", endDate);
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/analytics/revenue${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    throw error;
  }
};

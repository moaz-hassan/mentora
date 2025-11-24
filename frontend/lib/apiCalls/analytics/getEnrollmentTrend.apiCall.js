import axios from "axios";
import Cookies from "js-cookie";

/**
 * Get enrollment trend for instructor
 * @param {number} days - Number of days to look back (default: 30)
 * @param {string} groupBy - Grouping method: 'day', 'week', or 'month' (default: 'day')
 * @returns {Promise} Enrollment trend data
 */
export const getEnrollmentTrend = async (days = 30, groupBy = 'day') => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("days", days.toString());
    params.append("groupBy", groupBy);

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/analytics/enrollments?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching enrollment trend:", error);
    throw error;
  }
};

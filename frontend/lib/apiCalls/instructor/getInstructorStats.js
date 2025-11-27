import axios from "axios";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Get instructor statistics
 * @param {string|number} instructorId - Instructor user ID
 * @returns {Promise<Object>} Response with success flag and instructor stats
 * 
 * @example
 * const result = await getInstructorStats(123);
 * if (result.success) {
 *   console.log(result.data); // { totalStudents, totalCourses, averageRating, totalReviews }
 * }
 */
export default async function getInstructorStats(instructorId) {
  try {
    const response = await axios.get(`${API_URL}/api/instructor/${instructorId}/stats`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

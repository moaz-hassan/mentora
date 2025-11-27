import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Request password reset email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response with success flag and data/error
 * 
 * @example
 * const result = await forgotPassword('user@example.com');
 * if (result.success) {
 *   console.log(result.message);
 * }
 */
const forgotPassword = async (email) => {
  if (!email) {
    return {
      success: false,
      error: "Email is required",
    };
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/forgot-password`,
      { email }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default forgotPassword;

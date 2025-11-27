import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Reset user password with token
 * @param {string} email - User's email address
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise<Object>} Response with success flag and data/error
 * 
 * @example
 * const result = await resetPasswordApiCall('user@example.com', '123456', 'NewPass123!', 'NewPass123!');
 * if (result.success) {
 *   console.log(result.message);
 * }
 */
export default async function resetPasswordApiCall(
  email,
  token,
  newPassword,
  confirmPassword
) {
  // Validation
  if (!email || !token || !newPassword || !confirmPassword) {
    return {
      success: false,
      error: "All fields are required!",
    };
  }

  if (token.length !== 6) {
    return {
      success: false,
      error: "Invalid token!",
    };
  }
  if (newPassword.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long!",
    };
  }
  if (
    !newPassword.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
  ) {
    return {
      success: false,
      error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!",
    };
  }
  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match!",
    };
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/reset-password`,
      { email, token, newPassword }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

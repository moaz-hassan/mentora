import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();

/**
 * Register a new user account
 * @param {string} first_name - User's first name
 * @param {string} last_name - User's last name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise<Object>} Response with success flag and data/error
 * 
 * @example
 * const result = await registerApiCall('John', 'Doe', 'john@example.com', 'Password123!', 'Password123!');
 * if (result.success) {
 *   console.log(result.message);
 * } else {
 *   console.error(result.error);
 * }
 */
const registerApiCall = async (
  first_name,
  last_name,
  email,
  password,
  confirmPassword
) => {
  // Validation
  if (
    first_name === "" ||
    last_name === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    return {
      success: false,
      error: "All fields are required",
    };
  }
  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match",
    };
  }
  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters",
    };
  }
  if (
    !password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
  ) {
    return {
      success: false,
      error: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    };
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      {
        first_name,
        last_name,
        email,
        password,
      }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default registerApiCall;

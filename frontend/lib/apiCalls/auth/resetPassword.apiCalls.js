import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function resetPasswordApiCall(
  email,
  token,
  newPassword,
  confirmPassword
) {
  
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

import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();



export default async function loginApiCall(email, password) {
  
  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    };
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return {
      success: false,
      error: "Invalid email!",
    };
  }
  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long!",
    };
  }
  if (
    !password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
  ) {
    return {
      success: false,
      error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!",
    };
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

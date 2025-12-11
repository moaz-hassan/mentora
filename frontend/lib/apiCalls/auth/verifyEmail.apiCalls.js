import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export default async function verifyEmail(token, email) {
  if (!token || !email) {
    return {
      success: false,
      error: "Token and email are required",
    };
  }
  if (token.length !== 6) {
    return {
      success: false,
      error: "Invalid token",
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/verify-email`,
      {
        token,
        email,
      }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

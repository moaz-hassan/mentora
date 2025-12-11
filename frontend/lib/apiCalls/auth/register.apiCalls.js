import axios from "axios";
import { 
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


const registerApiCall = async (
  first_name,
  last_name,
  email,
  password,
  confirmPassword
) => {
  
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

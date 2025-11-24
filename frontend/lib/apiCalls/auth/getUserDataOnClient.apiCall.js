import axios from "axios";
import cookies from "js-cookie";

async function getUserDataOnClient() {
  const token = cookies.get("authToken");

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      success: false,
      message: error.response,
      data: null,
    };
  }
}

export default getUserDataOnClient;

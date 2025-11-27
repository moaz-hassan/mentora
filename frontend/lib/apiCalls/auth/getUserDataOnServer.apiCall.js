import axios from "axios";
import { cookies } from "next/headers";

async function getUserDataOnServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken");

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token?.value}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    if (error.response?.data?.message) {
      return { error: error.response.data.message };
    }
    return { error: "Failed to fetch user data" };
  }
}

export default getUserDataOnServer;

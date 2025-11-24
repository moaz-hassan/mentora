import axios from "axios";
import cookies from "js-cookie";

export default async function updateProfile(profileData) {
  const token = cookies.get("authToken");
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
      profileData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return error.response.data.message || "Something went wrong";
  }
};

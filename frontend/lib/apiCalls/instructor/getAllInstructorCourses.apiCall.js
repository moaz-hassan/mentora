import axios from "axios";
import Cookies from "js-cookie";

export const getAllInstructorCourses = async () => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/instructor/all-courses`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

import { getApiBaseUrl } from "@/lib/utils/apiHelpers";
import axios from "axios";

async function getFeaturedCourses() {
  try {
    const response = await axios.get(
      `${getApiBaseUrl()}/api/courses/featured`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    return "Failed to fetch featured courses";
  }
}

export default getFeaturedCourses;

import axios from "axios";
import { getApiBaseUrl, getAuthHeaders } from "@/lib/utils/apiHelpers";

export const createRating = async ({ courseId, rating, reviewText }) => {
  try {
    const response = await axios.post(
      `${getApiBaseUrl()}/api/reviews`,
      {
        course_id: courseId,
        rating: rating,
        review: reviewText,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to submit review",
    };
  }
};

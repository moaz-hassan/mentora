import axios from "axios";
import cookies from "js-cookie";

export const submitForReview = async (courseId) => {
  const token = cookies.get("authToken");
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/submit-review`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting for review:", error);
    throw error;
  }
};

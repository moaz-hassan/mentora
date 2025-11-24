import axios from "axios";
import cookie from "js-cookie";
export default async function courseSaveDraftApiCall(courseId) {
  const authToken = cookie.get("authToken");
  console.log(authToken);
  if (!authToken) {
    throw new Error("Authentication token not found");
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/save-draft`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving course as draft:", error);
    throw error;
  }
};

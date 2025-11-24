import axios from "axios";

export default async function getCourseById(courseId) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`
    );
    return response.data;
  } catch (error) {
    return (
      error.response.data.message ||
      error.response.message ||
      "Failed to fetch course"
    );
  }
}

/**
 * Update course general information
 * @param {string} courseId - The course ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Response with updated course data
 */
export const updateCourseInfo = async (courseId, updateData) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update course");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating course info:", error);
    throw error;
  }
};

/**
 * Update course thumbnail
 * @param {string} courseId - The course ID
 * @param {File} thumbnailFile - The thumbnail file to upload
 * @returns {Promise<Object>} Response with updated course data
 */
export const updateCourseThumbnail = async (courseId, thumbnailFile) => {
  try {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/thumbnail`,
      {
        method: "PUT",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update thumbnail");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating course thumbnail:", error);
    throw error;
  }
};

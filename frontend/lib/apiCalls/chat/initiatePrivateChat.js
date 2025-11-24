/**
 * Initiate a private chat with an instructor
 * @param {string} instructorId - The instructor's user ID
 * @param {string} courseId - The course ID (optional, for context)
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
export async function initiatePrivateChat(instructorId, courseId = null) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat/private`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          participant_id: instructorId,
          course_id: courseId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create private chat");
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error initiating private chat:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

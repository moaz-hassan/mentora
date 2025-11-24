import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

export const updateChapter = async (chapterId, chapterData, token) => {
  try {
    const response = await axios.put(`${API_URL}/chapters/${chapterId}`, chapterData, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      'Failed to update chapter'
    );
  }
};

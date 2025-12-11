import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;


export const createLessonMaterial = async (lessonId, materialData, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/lessons/${lessonId}/materials`,
      materialData,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      'Failed to create lesson material'
    );
  }
};

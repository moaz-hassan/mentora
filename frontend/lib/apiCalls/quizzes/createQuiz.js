import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;


export const createQuiz = async (quizData, token) => {
  try {
    const response = await axios.post(`${API_URL}/quizzes`, quizData, {
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
      'Failed to create quiz'
    );
  }
};

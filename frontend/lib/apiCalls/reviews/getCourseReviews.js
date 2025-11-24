import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

/**
 * Get course reviews
 */
export const getCourseReviews = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      'Failed to fetch reviews'
    );
  }
};

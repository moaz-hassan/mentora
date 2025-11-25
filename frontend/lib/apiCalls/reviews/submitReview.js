import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

/**
 * Submit a course review
 * @param {Object} reviewData - Review data
 * @param {string} reviewData.course_id - Course ID
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.review_text - Review text
 * @returns {Promise<Object>} - Created review object
 */
export const submitReview = async (reviewData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${API_URL}/reviews`, reviewData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      'Failed to submit review'
    );
  }
};

export default submitReview;

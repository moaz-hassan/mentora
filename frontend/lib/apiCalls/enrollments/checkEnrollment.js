import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

/**
 * Check if current user is enrolled in a course
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} - Enrollment status
 */
export const checkEnrollment = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    const response = await axios.get(`${API_URL}/enrollments/check/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data?.isEnrolled || false;
  } catch (error) {
    // If error (like 401), assume not enrolled
    console.error('Error checking enrollment:', error);
    return false;
  }
};

export default checkEnrollment;

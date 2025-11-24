import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

/**
 * Check if user is enrolled in course
 */
export const checkEnrollment = async (courseId) => {
  try {
    const token = Cookies.get('authToken');
    
    if (!token) {
      return { enrolled: false };
    }
    
    const response = await axios.get(`${API_URL}/enrollments/check/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    return { enrolled: false };
  }
};

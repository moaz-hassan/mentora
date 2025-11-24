import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

/**
 * Update course introduction video
 */
export const updateCourseIntroVideo = async (courseId, videoData) => {
  try {
    const token = Cookies.get('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.put(
      `${API_URL}/courses/${courseId}/intro-video`,
      videoData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      'Failed to update introduction video'
    );
  }
};

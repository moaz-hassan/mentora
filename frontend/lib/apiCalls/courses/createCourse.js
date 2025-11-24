import axios from "axios";
import Cookies from 'js-cookie';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

/**
 * Upload file with progress tracking
 */
const uploadWithProgress = async (url, formData, onProgress, token) => {
  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      'Upload failed'
    );
  }
};

/**
 * Build FormData for course creation
 */
const buildCourseFormData = (courseData, thumbnailFile) => {
  const formData = new FormData();

  if (courseData.title) formData.append('title', courseData.title);
  if (courseData.description) formData.append('description', courseData.description);
  if (courseData.category) formData.append('category', courseData.category);
  if (courseData.level) formData.append('level', courseData.level);
  if (courseData.price !== undefined) formData.append('price', courseData.price);

  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
  }

  return formData;
};

/**
 * Create a course with thumbnail
 */
export const createCourse = async (courseData, thumbnailFile, onProgress, token) => {
  const formData = buildCourseFormData(courseData, thumbnailFile);
  return uploadWithProgress(`${API_URL}/courses`, formData, onProgress, token);
};

import axios from "axios";
import { 
  getAuthToken,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;

const uploadWithProgress = async (url, formData, onProgress, token) => {
  try {
    const authToken = token || getAuthToken();
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
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


const buildCourseFormData = (courseData, thumbnailFile) => {
  const formData = new FormData();

  if (courseData.title) formData.append('title', courseData.title);
  if (courseData.subtitle) formData.append('subtitle', courseData.subtitle);
  if (courseData.description) formData.append('description', courseData.description);
  if (courseData.category) formData.append('category', courseData.category);
  if (courseData.subcategory_id) formData.append('subcategory_id', courseData.subcategory_id);
  if (courseData.level) formData.append('level', courseData.level);
  if (courseData.price !== undefined) formData.append('price', courseData.price);
  
  if (courseData.learning_objectives) formData.append('learning_objectives', courseData.learning_objectives);
  if (courseData.requirements) formData.append('requirements', courseData.requirements);
  if (courseData.target_audience) formData.append('target_audience', courseData.target_audience);

  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
  }

  return formData;
};


export const createCourse = async (courseData, thumbnailFile, onProgress, token) => {
  const formData = buildCourseFormData(courseData, thumbnailFile);
  return uploadWithProgress(`${API_URL}/courses`, formData, onProgress, token);
};

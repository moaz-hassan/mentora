import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;

export const verifyEnrollmentAccess = async (enrollmentId, courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/course/${courseId}/access`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getEnrollmentById = async (enrollmentId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/enrollments/${enrollmentId}`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getCoursePlayerData = async (enrollmentId, courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/course/${courseId}/player`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getProgress = async (enrollmentId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/progress`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const updateProgress = async (enrollmentId, progressData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/enrollments/${enrollmentId}/progress`,
      progressData,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getMyEnrollments = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/enrollments`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get lesson detail (lazy loading)
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Response with full lesson data including video URLs and materials
 */
export const getLessonDetail = async (enrollmentId, lessonId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/lessons/${lessonId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Get quiz detail (lazy loading)
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Response with full quiz data including questions
 */
export const getQuizDetail = async (enrollmentId, quizId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/quizzes/${quizId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Mark lesson as complete
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Response with updated progress
 */
export const markLessonComplete = async (enrollmentId, lessonId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/enrollments/${enrollmentId}/lessons/${lessonId}/complete`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Submit quiz answers
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} quizId - Quiz ID
 * @param {Object} answers - User answers {questionIndex: answer}
 * @returns {Promise<Object>} Response with quiz results
 */
export const submitQuiz = async (enrollmentId, quizId, answers) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/enrollments/${enrollmentId}/quizzes/${quizId}/submit`,
      { answers },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

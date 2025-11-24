import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Verify enrollment access for course player
 */
export const verifyEnrollmentAccess = async (enrollmentId, courseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/course/${courseId}/access`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying enrollment access:", error);
    throw error;
  }
};

/**
 * Get course player data with full content
 */
export const getCoursePlayerData = async (enrollmentId, courseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/course/${courseId}/player`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching course player data:", error);
    throw error;
  }
};

/**
 * Get student progress
 */
export const getProgress = async (enrollmentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/progress`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw error;
  }
};

/**
 * Update student progress
 */
export const updateProgress = async (enrollmentId, progressData) => {
  try {
    const response = await axios.put(
      `${API_URL}/enrollments/${enrollmentId}/progress`,
      progressData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};

/**
 * Get all enrollments for a student
 */
export const getMyEnrollments = async () => {
  try {
    const response = await axios.get(`${API_URL}/enrollments`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    throw error;
  }
};

import axios from "axios";
import cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = cookies.get("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Material Service API calls
export const materialService = {
  /**
   * Upload file to Cloudinary with signature (like video/image uploads)
   * @param {File} file - File to upload
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Cloudinary upload result
   */
  async uploadToCloudinary(file, onProgress) {
    try {
      // Step 1: Get upload signature from backend
      const signatureResponse = await apiClient.post("/api/cloudinary/material-signature");
      
      if (!signatureResponse.success) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse.data;

      // Step 2: Upload to Cloudinary with signature
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error(error.response?.data?.error?.message || "Failed to upload to Cloudinary");
    }
  },

  /**
   * Save material metadata to backend
   * @param {string} lessonId - Lesson ID
   * @param {object} materialData - Material metadata
   * @returns {Promise<object>} Saved material
   */
  async saveMaterial(lessonId, materialData) {
    try {
      const response = await apiClient.post(
        `/api/lessons/${lessonId}/materials`,
        materialData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all materials for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<object>} List of materials
   */
  async getLessonMaterials(lessonId) {
    try {
      const response = await apiClient.get(`/api/lessons/${lessonId}/materials`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a material
   * @param {string} materialId - Material ID
   * @returns {Promise<object>} Deletion result
   */
  async deleteMaterial(materialId) {
    try {
      const response = await apiClient.delete(`/api/materials/${materialId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update material order
   * @param {string} lessonId - Lesson ID
   * @param {Array} materials - Array of {id, order_number}
   * @returns {Promise<object>} Update result
   */
  async updateMaterialOrder(lessonId, materials) {
    try {
      const response = await apiClient.put(
        `/api/lessons/${lessonId}/materials/order`,
        { materials }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default materialService;

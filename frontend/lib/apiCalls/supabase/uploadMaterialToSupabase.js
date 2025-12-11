import axios from "axios";
import Cookies from "js-cookie";

const API_URL = `${
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}/api`;

/**
 * Upload a material file to Supabase via backend
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} - Upload result with url and public_id
 */
export const uploadMaterialToSupabase = async (file, onProgress) => {
  try {
    const token = Cookies.get("authToken");

    if (!token) {
      throw new Error("Authentication required");
    }

    if (onProgress) {
      onProgress(0);
    }

    // Create FormData with file
    const formData = new FormData();
    formData.append("file", file);

    // Upload to backend (which uploads to Supabase)
    const response = await axios.post(
      `${API_URL}/materials/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Upload failed");
    }

    // Return in same format as before for compatibility
    return {
      secure_url: response.data.data.url,
      public_id: response.data.data.public_id,
      format: response.data.data.file_type,
      bytes: response.data.data.file_size,
      original_filename: response.data.data.filename,
      download_url: response.data.data.download_url,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Material upload failed";
    throw new Error(errorMessage);
  }
};

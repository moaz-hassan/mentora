import axios from "axios";
import Cookies from "js-cookie";

const API_URL = `${
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}/api`;

export const uploadFileToCloudinary = async (file, onProgress) => {
  try {
    const token = Cookies.get("authToken");

    if (!token) {
      throw new Error("Authentication required");
    }
    if (onProgress) {
      onProgress(0);
    }

    const signatureResponse = await axios.post(
      `${API_URL}/cloudinary/material-signature`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { signature, timestamp, cloudName, apiKey, folder } =
      signatureResponse.data.data;

    // Step 2: Build FormData for Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);

    // Step 3: Upload directly to Cloudinary
    // Use 'raw' or 'auto' for generic files
    const resourceType = "raw"; // or 'auto'

    const uploadResponse = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      formData,
      {
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

    // Step 4: Return complete metadata
    return {
      secure_url: uploadResponse.data.secure_url,
      public_id: uploadResponse.data.public_id,
      format: uploadResponse.data.format,
      bytes: uploadResponse.data.bytes,
      resource_type: uploadResponse.data.resource_type,
      original_filename: uploadResponse.data.original_filename,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "File upload failed";
    throw new Error(errorMessage);
  }
};

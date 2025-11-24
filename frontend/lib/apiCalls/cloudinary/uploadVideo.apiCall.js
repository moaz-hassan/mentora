import axios from "axios";
import { getCloudinarySignature } from "./getCloudinarySignature.apiCall";

export const uploadVideo = async (file , setProgress) => {
  const { signature, timestamp, apiKey, cloudName, uploadPreset } =
    await getCloudinarySignature();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("api_key", apiKey);
  formData.append("upload_preset", uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

  try {
    const upload = await axios.post(uploadUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percent);
      },
    });
    return upload.data;
  } catch (error) {
    throw error.response.data;
  }
};

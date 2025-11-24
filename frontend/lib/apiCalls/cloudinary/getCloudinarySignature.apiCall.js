import axios from "axios";

export const getCloudinarySignature = async () => {
  try {
    const res = await axios.get("/api/cloudinary/signature");
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

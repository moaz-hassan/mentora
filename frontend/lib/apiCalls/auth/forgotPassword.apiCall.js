import axios from "axios";

const forgotPassword = async (email) => {
    if(!email){
        throw new Error("Email is required");
    }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
      { email }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default forgotPassword;

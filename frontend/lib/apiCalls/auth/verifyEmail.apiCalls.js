import axios from "axios";

export default async function verifyEmail(token, email) {
  if (!token || !email) {
    throw new Error("Token and email are required");
  }
  if (token.length !== 6) {
    throw new Error("Invalid token");
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`,
      {
        token,
        email,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

import axios from "axios";

export default async function loginApiCall(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error("Invalid email!");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long!");
  }
  if (
    !password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
  ) {
    throw new Error(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!"
    );
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      { email, password }
    );
    return response.data;
  } catch (error) {
    throw error.response.data.error;
  }
}

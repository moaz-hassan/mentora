import axios from "axios";

export default async function resetPasswordApiCall(
  email,
  token,
  newPassword,
  confirmPassword
) {
  console.log(email,token,newPassword,confirmPassword);
  
  if (!email || !token || !newPassword || !confirmPassword) {
    throw new Error("All fields are required!");
  }

  if (token.length !== 6) {
    throw new Error("Invalid token!");
  }
  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long!");
  }
  if (
    !newPassword.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
  ) {
    throw new Error(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!"
    );
  }
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
      { email, token, newPassword }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

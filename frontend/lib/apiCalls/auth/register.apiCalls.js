import axios from "axios";

const registerApiCall = async (
  first_name,
  last_name,
  email,
  password,
  confirmPassword
) => {
  if (
    first_name === "" ||
    last_name === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    throw new Error("All fields are required");
  }
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (
    !password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
  ) {
    throw new Error(
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    );
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        first_name,
        last_name,
        email,
        password,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default registerApiCall;

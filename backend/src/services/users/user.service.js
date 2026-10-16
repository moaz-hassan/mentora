import bcrypt from "bcryptjs";
import userRepository from "../../repositories/auth/user.repository.js";
import profileRepository from "../../repositories/auth/profile.repository.js";
import enrollmentRepository from "../../repositories/courses/enrollment.repository.js";

export const getAllUsers = async () => {
  return await userRepository.find();
};

export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const userPayload = user.toJSON();
  if (!userPayload.Profile) {
    const profile = await profileRepository.findByUserId(userId);
    userPayload.Profile = profile ? profile.toJSON() : userPayload.profile || {};
  }

  return userPayload;
};

export const createUser = async (userData) => {
  const { first_name, last_name, email, password, role = "student" } = userData;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await userRepository.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    role,
    profile: {
      bio: "",
      avatar_url: "",
      headline: "",
      social_links: {},
    },
  });

  await profileRepository.create({
    user_id: user.id,
    bio: "",
    avatar_url: "",
    headline: "",
    social_links: {},
  });

  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

export const updateUserProfile = async (userId, updateData) => {
  const allowedUpdateData = {};
  if (updateData.first_name !== undefined) {
    allowedUpdateData.first_name = updateData.first_name;
  }
  if (updateData.last_name !== undefined) {
    allowedUpdateData.last_name = updateData.last_name;
  }

  const user = await userRepository.updateById(userId, allowedUpdateData);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

export const updateUser = async (userId, updateData) => {
  const dataToUpdate = { ...updateData };

  if (dataToUpdate.password) {
    const salt = await bcrypt.genSalt(10);
    dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, salt);
  }

  const user = await userRepository.updateById(userId, dataToUpdate);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

export const deleteUser = async (userId) => {
  const user = await userRepository.deleteById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await profileRepository.deleteByUserId(userId);
  return { message: "User deleted successfully" };
};

export const becomeInstructor = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "instructor") {
    const error = new Error("You are already an instructor");
    error.statusCode = 400;
    throw error;
  }

  if (user.role === "admin") {
    const error = new Error("Admins cannot become instructors");
    error.statusCode = 400;
    throw error;
  }

  if (user.role !== "student") {
    const error = new Error("Only students can become instructors");
    error.statusCode = 400;
    throw error;
  }

  const enrollmentCount = await enrollmentRepository.countByStudentId(userId);
  if (enrollmentCount > 0) {
    const error = new Error(
      "You cannot become an instructor because you are enrolled in courses. Students with active enrollments cannot switch to instructor role."
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await userRepository.updateById(userId, { role: "instructor" });
  return updatedUser.toJSON();
};

export const toggleUserStatus = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await userRepository.updateById(userId, {
    is_active: !user.is_active,
  });

  return updatedUser.toJSON();
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUser,
  deleteUser,
  becomeInstructor,
};

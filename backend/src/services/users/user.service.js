

import bcrypt from "bcryptjs";
import models from "../../models/index.js";

const { User, Profile } = models;


export const getAllUsers = async () => {
  const users = await User.findAll({
    include: [{ model: Profile }],
    attributes: { exclude: ["password"] },
  });
  return users;
};


export const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Profile }],
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};


export const createUser = async (userData) => {
  const { full_name, email, password, role = "student" } = userData;

  
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  
  const user = await User.create({
    full_name,
    email,
    password: hashedPassword,
    role,
  });

  
  await Profile.create({
    user_id: user.id,
  });

  
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};


export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  
  const allowedUpdateData = {};
  if (updateData.first_name !== undefined) {
    allowedUpdateData.first_name = updateData.first_name;
  }
  if (updateData.last_name !== undefined) {
    allowedUpdateData.last_name = updateData.last_name;
  }

  
  await user.update(allowedUpdateData);

  
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};


export const updateUser = async (userId, updateData) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  
  await user.update(updateData);

  
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};


export const deleteUser = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await user.destroy();

  return { message: "User deleted successfully" };
};


export const becomeInstructor = async (userId) => {
  const { Enrollment } = models;

  const user = await User.findByPk(userId);

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

  
  const enrollmentCount = await Enrollment.count({
    where: { student_id: userId },
  });

  if (enrollmentCount > 0) {
    const error = new Error(
      "You cannot become an instructor because you are enrolled in courses. Students with active enrollments cannot switch to instructor role."
    );
    error.statusCode = 400;
    throw error;
  }

  
  await user.update({ role: "instructor" });

  
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};


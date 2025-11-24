/**
 * User Service
 * Purpose: Handle user-related business logic
 * Includes: CRUD operations for users
 */

import bcrypt from "bcryptjs";
import models from "../models/index.model.js";

const { User, Profile } = models;

/**
 * Get all users
 * @returns {Array} List of users
 */
export const getAllUsers = async () => {
  const users = await User.findAll({
    include: [{ model: Profile }],
    attributes: { exclude: ["password"] },
  });
  return users;
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
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

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
export const createUser = async (userData) => {
  const { full_name, email, password, role = "student" } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    full_name,
    email,
    password: hashedPassword,
    role,
  });

  // Create empty profile
  await Profile.create({
    user_id: user.id,
  });

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

/**
 * Update user profile (first_name and last_name only)
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update (first_name, last_name only)
 * @returns {Object} Updated user
 */
export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Only allow updating first_name and last_name
  const allowedUpdateData = {};
  if (updateData.first_name !== undefined) {
    allowedUpdateData.first_name = updateData.first_name;
  }
  if (updateData.last_name !== undefined) {
    allowedUpdateData.last_name = updateData.last_name;
  }

  // Update user
  await user.update(allowedUpdateData);

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user
 */
export const updateUser = async (userId, updateData) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // If password is being updated, hash it
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  // Update user
  await user.update(updateData);

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
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

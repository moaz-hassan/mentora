import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userRepository from "../../repositories/auth/user.repository.js";
import tokenRepository from "../../repositories/auth/token.repository.js";
import profileRepository from "../../repositories/auth/profile.repository.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email.service.js";
import generateVerificationToken from "./token.service.js";

export const registerUser = async (userData) => {
  const {
    first_name,
    last_name,
    email,
    password,
    role = "student",
  } = userData;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = await generateVerificationToken(
    email,
    "verify-email"
  );

  await sendVerificationEmail(email, verificationToken);

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

  // Also maintain standalone profile record for compatibility
  await profileRepository.create({
    user_id: user.id,
    bio: "",
    avatar_url: "",
    headline: "",
    social_links: {},
  });

  return user;
};

export const loginUser = async (email, password) => {
  const user = await userRepository.findByEmail(email, true);

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  const userResponse = user.toJSON();
  delete userResponse.password;

  return { user: userResponse, token };
};

export const verifyEmail = async (email, token) => {
  const tokenRecord = await tokenRepository.findValidToken(
    email,
    token,
    "verify-email"
  );

  if (!tokenRecord) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(tokenRecord.email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await userRepository.markEmailVerified(user.id);
  await tokenRepository.deleteToken(tokenRecord.id);

  return { message: "Email verified successfully" };
};

export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    const error = new Error("User with this email does not exist");
    error.statusCode = 404;
    throw error;
  }

  // Clear existing reset tokens for this email
  await tokenRepository.deleteByEmailAndPurpose(email, "reset-password");

  const resetToken = await generateVerificationToken(email, "reset-password");
  await sendPasswordResetEmail(email, resetToken);

  return { message: "Password reset email sent" };
};

export const resetPassword = async (email, token, newPassword) => {
  const tokenRecord = await tokenRepository.findValidToken(
    email,
    token,
    "reset-password"
  );

  if (!tokenRecord) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(tokenRecord.email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await userRepository.updatePassword(user.id, hashedPassword);

  await tokenRepository.deleteToken(tokenRecord.id);

  return { message: "Password reset successfully" };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findById(userId, true);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid current password");
    error.statusCode = 401;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await userRepository.updatePassword(user.id, hashedPassword);

  return { message: "Password changed successfully" };
};

export const resendVerificationEmail = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.is_email_verified) {
    const error = new Error("Email is already verified");
    error.statusCode = 400;
    throw error;
  }

  await tokenRepository.deleteByEmailAndPurpose(user.email, "verify-email");

  const verificationToken = await generateVerificationToken(
    user.email,
    "verify-email"
  );

  await sendVerificationEmail(user.email, verificationToken);

  return { message: "Verification email sent" };
};

export const getCurrentUser = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Ensure user.Profile is populated for backward compatibility with frontend
  const userPayload = user.toJSON();
  if (!userPayload.Profile) {
    const standaloneProfile = await profileRepository.findByUserId(userId);
    userPayload.Profile = standaloneProfile
      ? standaloneProfile.toJSON()
      : userPayload.profile || {};
  }

  return userPayload;
};

export default {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  getCurrentUser,
};

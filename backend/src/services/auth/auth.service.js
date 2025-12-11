import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import models from "../../models/index.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email.service.js";
import generateVerificationToken from "./token.service.js";
const { User, Profile, Token } = models;

export const registerUser = async (userData) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role = "student",
    } = userData;

    const existingUser = await User.findOne({ where: { email } });
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

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
    });

    await Profile.create({
      user_id: user.id,
    });
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ where: { email } });

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
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );    

    const userResponse = user.toJSON();
    delete userResponse.password;

    return { user: userResponse, token };
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (email, token) => {
  try {    
    const tokenRecord = await Token.findOne({
      where: { email, token, purpose: "verify-email" },
    });

    if (!tokenRecord) {
      const error = new Error("Invalid or expired token");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ where: { email: tokenRecord.email } });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.is_email_verified = true;
    await user.save();

    await tokenRecord.destroy();
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
 try {
   const user = await User.findOne({ where: { email } });

  if (!user) {
    const error = new Error("User with this email does not exist");
    error.statusCode = 404;
    throw error;
  }

  const resetToken = await generateVerificationToken(email, "reset-password");

  await sendPasswordResetEmail(email, resetToken);
 } catch (error) {
  throw error;
 }
};

export const resetPassword = async (email, token, newPassword) => {
  try {
    const tokenRecord = await Token.findOne({
      where: {email, token, purpose: "reset-password" },
    });

    if (!tokenRecord) {
      const error = new Error("Invalid or expired token");
      error.statusCode = 400;
      throw error;
    }

    if (tokenRecord.expires_at < new Date()) {
      await tokenRecord.destroy();
      const error = new Error("Invalid or expired token");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ where: { email: tokenRecord.email } });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    await tokenRecord.destroy();
    

  } catch (error) {
    throw error;
  }
};


export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findByPk(userId);
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
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: "Password changed successfully" };
  } catch (error) {
    throw error;
  }
};

export const resendVerificationEmail = async (userId) => {
  try {
    const user = await User.findByPk(userId);
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

    
    await Token.destroy({ where: { email: user.email, purpose: "verify-email" } });

    const verificationToken = await generateVerificationToken(
      user.email,
      "verify-email"
    );

    await sendVerificationEmail(user.email, verificationToken);

    return { message: "Verification email sent" };
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async (userId) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

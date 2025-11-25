import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { sendVerificationEmail } from "../services/auth/email.service.js";
import generateVerificationToken from "../utils/generateVerificationCode.js";

const { User } = models;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Authorization denied.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({
      where: { id: decoded.id, email: decoded.email, role: decoded.role },
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "role",
        "is_email_verified",
        "is_active",
      ],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Authorization denied.",
      });
    }

    if (user.is_email_verified === false) {
      const verificationToken = await generateVerificationToken(
        user.email,
        "verify-email"
      );
      await sendVerificationEmail(user.email, verificationToken);
      const error = new Error(
        "User is not verified! Please check your email for verification."
      );
      error.statusCode = 401;
      throw error;
    }

    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token. Authorization denied.",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    next();
  }
};

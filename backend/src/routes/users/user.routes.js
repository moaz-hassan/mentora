import express from "express";
import * as userController from "../../controllers/users/user.controller.js";
import { createUserValidator, updateUserValidator, userIdValidator } from "../../validators/users/user.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", authenticate, userIdValidator, validateResult, userController.getUserById);

// POST /api/users - Create a new user (admin only)
router.post("/", authenticate, authorize("admin"), createUserValidator, validateResult, userController.createUser);

// PUT /api/users/:id - Update user (admin only)
router.put("/:id", authenticate, authorize("admin"), updateUserValidator, validateResult, userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/:id", authenticate, authorize("admin"), userIdValidator, validateResult, userController.deleteUser);

// POST /api/users/become-instructor - Convert student to instructor (students only)
router.post("/become-instructor", authenticate, authorize("student"), userController.becomeInstructor);

export default router;


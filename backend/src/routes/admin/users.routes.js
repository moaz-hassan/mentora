/**
 * Admin Users Routes
 */
import express from "express";
import * as userController from "../../controllers/users/user.controller.js";

const router = express.Router();

// Toggle user status
router.patch("/:id/status", userController.toggleUserStatus);

export default router;

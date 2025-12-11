
import express from "express";
import * as userController from "../../controllers/users/user.controller.js";

const router = express.Router();


router.patch("/:id/status", userController.toggleUserStatus);

export default router;

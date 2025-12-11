import express from "express";
import * as userController from "../../controllers/users/user.controller.js";
import { createUserValidator, updateUserValidator, userIdValidator } from "../../validators/users/user.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/", authenticate, authorize("admin"), userController.getAllUsers);


router.get("/:id", authenticate, userIdValidator, validateResult, userController.getUserById);


router.post("/", authenticate, authorize("admin"), createUserValidator, validateResult, userController.createUser);


router.put("/:id", authenticate, authorize("admin"), updateUserValidator, validateResult, userController.updateUser);


router.delete("/:id", authenticate, authorize("admin"), userIdValidator, validateResult, userController.deleteUser);


router.post("/become-instructor", authenticate, authorize("student"), userController.becomeInstructor);

export default router;


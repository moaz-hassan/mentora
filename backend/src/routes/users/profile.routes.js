import express from "express";
import * as profileController from "../../controllers/users/profile.controller.js";
import { updateProfileValidator } from "../../validators/users/profile.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/", authenticate, profileController.getProfile);


router.put("/", authenticate, updateProfileValidator, validateResult, profileController.updateProfile);

export default router;

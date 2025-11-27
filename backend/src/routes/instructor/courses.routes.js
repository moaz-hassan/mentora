import express from "express";
import * as instructorController from "../../controllers/instructor/courses.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("instructor"));

router.get("/all", instructorController.getAllCourses);

export default router;

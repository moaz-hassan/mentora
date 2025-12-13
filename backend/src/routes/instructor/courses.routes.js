import express from "express";
import * as instructorController from "../../controllers/instructor/courses.controller.js";
import * as courseController from "../../controllers/courses/course.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("instructor"));

router.get("/all", instructorController.getAllCourses);

// Delete course (only draft/rejected courses with no enrollments)
router.delete("/:id", courseController.deleteCourse);

export default router;


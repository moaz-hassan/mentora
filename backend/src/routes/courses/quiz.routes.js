import express from "express";
import * as quizController from "../../controllers/courses/quiz.controller.js";
import { 
  createQuizValidator, 
  updateQuizValidator, 
  submitQuizValidator,
  quizIdValidator,
} from "../../validators/courses/quiz.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/:id", authenticate, quizIdValidator, validateResult, quizController.getQuizById);

router.post("/", authenticate, authorize("instructor"), createQuizValidator, validateResult, quizController.createQuiz);

router.put("/:id", authenticate, authorize("instructor"), updateQuizValidator, validateResult, quizController.updateQuiz);

router.delete("/:id", authenticate, authorize("instructor"), quizIdValidator, validateResult, quizController.deleteQuiz);

router.get("/:quizId/results", authenticate, authorize("instructor"), quizController.getQuizResultsByQuiz);

router.post("/submit", authenticate, submitQuizValidator, validateResult, quizController.submitQuizResult);

router.get("/results/student/:studentId", authenticate, quizController.getQuizResultsByStudent);

export default router;

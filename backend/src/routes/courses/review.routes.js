import express from "express";
import * as reviewController from "../../controllers/courses/review.controller.js";
import { createReviewValidator, updateReviewValidator, reviewIdValidator, reviewQueryValidator } from "../../validators/courses/review.validator.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, validateResult, reviewController.getAllReviews);

router.post("/", authenticate, createReviewValidator, validateResult, reviewController.createReview);

router.put("/", authenticate, updateReviewValidator, validateResult, reviewController.updateReview);

router.delete("/", authenticate, reviewIdValidator, validateResult, reviewController.deleteReview);

export default router;

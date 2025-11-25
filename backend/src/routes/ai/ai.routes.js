import express from "express";
import { chat, analyze, suggest, getExamples } from "../../controllers/ai/ai.controller.js";
import { optionalAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Chat endpoint - accessible to all users (authenticated and unauthenticated)
router.post("/chat", optionalAuth, chat);

// Get example questions - accessible to all users
router.get("/examples", optionalAuth, getExamples);

// Analyze content - requires authentication
router.post("/analyze", optionalAuth, analyze);

// Get suggestions - requires authentication
router.post("/suggest", optionalAuth, suggest);

export default router;

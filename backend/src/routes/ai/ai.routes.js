import express from "express";
import { chat, analyze, suggest, getExamples } from "../../controllers/ai/ai.controller.js";
import { optionalAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/chat", optionalAuth, chat);


router.get("/examples", optionalAuth, getExamples);


router.post("/analyze", optionalAuth, analyze);


router.post("/suggest", optionalAuth, suggest);

export default router;

import express from "express";
import * as chapterController from "../controllers/chapter.controller.js";
import { createChapterValidator, updateChapterValidator, chapterDeleteValidator } from "../validators/chapter.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize("instructor", "admin"), createChapterValidator, validateResult, chapterController.createChapter);

router.put("/:id", authenticate, authorize("instructor", "admin"), updateChapterValidator, validateResult, chapterController.updateChapter);

router.delete("/:id", authenticate, authorize("instructor", "admin"), chapterDeleteValidator, validateResult, chapterController.deleteChapter);

export default router;

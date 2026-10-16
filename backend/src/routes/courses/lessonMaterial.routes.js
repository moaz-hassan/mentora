import express from "express";
import {
  saveMaterial,
  getLessonMaterials,
  deleteMaterial,
  updateMaterialOrder,
  downloadMaterial,
} from "../../controllers/courses/lessonMaterial.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { downloadLimiter } from "../../rate-limiters/playback.limiter.js";
import accessLogMiddleware from "../../middlewares/accessLog.middleware.js";

const router = express.Router();


router.use(authenticate);


router.post("/lessons/:lessonId/materials", saveMaterial);


router.get("/lessons/:lessonId/materials", getLessonMaterials);

router.get('/materials/:materialId/download', downloadLimiter, accessLogMiddleware(), downloadMaterial);


router.delete("/materials/:materialId", deleteMaterial);


router.put("/lessons/:lessonId/materials/order", updateMaterialOrder);

export default router;

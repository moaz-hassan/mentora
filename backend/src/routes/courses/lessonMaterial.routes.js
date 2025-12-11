import express from "express";
import {
  saveMaterial,
  getLessonMaterials,
  deleteMaterial,
  updateMaterialOrder,
} from "../../controllers/courses/lessonMaterial.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.use(authenticate);


router.post("/lessons/:lessonId/materials", saveMaterial);


router.get("/lessons/:lessonId/materials", getLessonMaterials);


router.delete("/materials/:materialId", deleteMaterial);


router.put("/lessons/:lessonId/materials/order", updateMaterialOrder);

export default router;

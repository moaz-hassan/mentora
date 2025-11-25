import express from "express";
import {
  saveMaterial,
  getLessonMaterials,
  deleteMaterial,
  updateMaterialOrder,
} from "../../controllers/courses/lessonMaterial.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Save material metadata (file already uploaded to Cloudinary from frontend)
router.post("/lessons/:lessonId/materials", saveMaterial);

// Get all materials for a lesson
router.get("/lessons/:lessonId/materials", getLessonMaterials);

// Delete a material
router.delete("/materials/:materialId", deleteMaterial);

// Update material order
router.put("/lessons/:lessonId/materials/order", updateMaterialOrder);

export default router;

import express from "express";
import multer from "multer";
import { uploadMaterial } from "../../controllers/media/materialUpload.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Configure multer for memory storage (file in buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// All routes require authentication
router.use(authenticate);

// Upload material to Supabase Storage
router.post("/upload", upload.single("file"), uploadMaterial);

export default router;

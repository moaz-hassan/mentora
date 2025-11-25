/**
 * Instructor Batch Upload Routes
 */
import express from "express";
import * as batchUploadController from "../../controllers/instructor/batchUpload.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { uploadVideo } from "../../middlewares/upload.middleware.js";

const router = express.Router();

// All routes require instructor authentication
router.use(authenticate);
router.use(authorize("instructor"));

// Initialize batch upload session
router.post("/:courseId/init", batchUploadController.initBatchUpload);

// Upload video in batch
router.post(
  "/:courseId/upload",
  uploadVideo,
  batchUploadController.uploadVideo
);

// Complete batch upload
router.post("/:courseId/complete", batchUploadController.completeBatchUpload);

// Cancel batch upload
router.delete("/:courseId/cancel", batchUploadController.cancelBatchUpload);

// Get session status
router.get("/:courseId/status", batchUploadController.getSessionStatus);

export default router;

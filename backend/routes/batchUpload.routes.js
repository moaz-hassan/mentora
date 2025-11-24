import express from "express";
import * as batchUploadController from "../controllers/batchUpload.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadVideo } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Initialize batch upload session
router.post(
  "/:courseId/batch-upload/init",
  authenticate,
  authorize("instructor"),
  batchUploadController.initBatchUpload
);

// Upload single video in batch
router.post(
  "/:courseId/batch-upload/video",
  authenticate,
  authorize("instructor"),
  uploadVideo,
  batchUploadController.uploadVideo
);

// Complete batch upload
router.post(
  "/:courseId/batch-upload/complete",
  authenticate,
  authorize("instructor"),
  batchUploadController.completeBatchUpload
);

// Cancel batch upload
router.delete(
  "/:courseId/batch-upload/cancel",
  authenticate,
  authorize("instructor"),
  batchUploadController.cancelBatchUpload
);

// Get session status
router.get(
  "/:courseId/batch-upload/status/:sessionId",
  authenticate,
  authorize("instructor"),
  batchUploadController.getSessionStatus
);

export default router;

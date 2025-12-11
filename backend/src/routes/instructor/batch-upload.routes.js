
import express from "express";
import * as batchUploadController from "../../controllers/instructor/batchUpload.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { uploadVideo } from "../../middlewares/upload.middleware.js";

const router = express.Router();


router.use(authenticate);
router.use(authorize("instructor"));


router.post("/:courseId/init", batchUploadController.initBatchUpload);


router.post(
  "/:courseId/upload",
  uploadVideo,
  batchUploadController.uploadVideo
);


router.post("/:courseId/complete", batchUploadController.completeBatchUpload);


router.delete("/:courseId/cancel", batchUploadController.cancelBatchUpload);


router.get("/:courseId/status", batchUploadController.getSessionStatus);

export default router;

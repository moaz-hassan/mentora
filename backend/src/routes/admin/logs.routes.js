
import express from "express";
import * as logsController from "../../controllers/admin/logs.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


router.get("/audit", logsController.getAuditLogs);


router.get("/payments", logsController.getPaymentLogs);


router.get("/enrollments", logsController.getEnrollmentLogs);


router.get("/errors", logsController.getErrorLogs);


router.get("/analytics", logsController.getLogAnalytics);


router.get("/search", logsController.searchAllLogs);


router.post(
  "/export",
  body("logType")
    .isIn(["audit", "payment", "enrollment", "error"])
    .withMessage("Invalid log type"),
  validateResult,
  logsController.exportLogs
);

export default router;

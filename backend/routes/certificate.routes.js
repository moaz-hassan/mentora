/**
 * Certificate Routes
 * Base path: /api/certificates
 */

import express from "express";
import * as certificateController from "../controllers/certificate.controller.js";
import { createCertificateValidator, updateCertificateValidator, certificateIdValidator, certificateQueryValidator } from "../validators/certificate.validator.js";
import { validateResult } from "../middlewares/validateResult.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/certificates - Get all certificates
router.get("/", authenticate, certificateQueryValidator, validateResult, certificateController.getAllCertificates);

// GET /api/certificates/:id - Get certificate by ID
router.get("/:id", authenticate, certificateIdValidator, validateResult, certificateController.getCertificateById);

// POST /api/certificates - Create a new certificate (instructor/admin only)
router.post("/", authenticate, authorize("instructor", "admin"), createCertificateValidator, validateResult, certificateController.createCertificate);

// PUT /api/certificates/:id - Update certificate (admin only)
router.put("/:id", authenticate, authorize("admin"), updateCertificateValidator, validateResult, certificateController.updateCertificate);

// DELETE /api/certificates/:id - Delete certificate (admin only)
router.delete("/:id", authenticate, authorize("admin"), certificateIdValidator, validateResult, certificateController.deleteCertificate);

export default router;

// Generate certificate
router.post(
  "/generate",
  authenticate,
  authorize("student"),
  certificateController.generateCertificate
);

// Download certificate PDF
router.get(
  "/:id/download",
  authenticate,
  certificateIdValidator,
  validateResult,
  certificateController.downloadCertificate
);

// Verify certificate (public route)
router.get(
  "/verify/:certificateId",
  certificateController.verifyCertificate
);

// Get student certificates
router.get(
  "/students/:studentId",
  authenticate,
  certificateController.getStudentCertificates
);

/**
 * Certificate Routes
 * Base path: /api/certificates
 */

import express from "express";
import * as certificateController from "../../controllers/users/certificate.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/certificates/generate - Generate certificate for completed course
router.post(
  "/generate",
  authenticate,
  certificateController.generateCertificate
);

// GET /api/certificates/my - Get all certificates for authenticated user
router.get(
  "/my",
  authenticate,
  certificateController.getMyCertificates
);

// GET /api/certificates/check/:courseId - Check if certificate exists for a course
router.get(
  "/check/:courseId",
  authenticate,
  certificateController.checkCertificateExists
);

// GET /api/certificates/:id/verify - Verify a certificate (public route)
router.get(
  "/:id/verify",
  certificateController.verifyCertificate
);

// GET /api/certificates/:id/download - Download certificate PDF
router.get(
  "/:id/download",
  authenticate,
  certificateController.downloadCertificate
);

// GET /api/certificates/:id - Get certificate by ID (with auth check)
router.get(
  "/:id",
  authenticate,
  certificateController.getCertificateById
);

// GET /api/certificates - Get all certificates (admin only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  certificateController.getAllCertificates
);

export default router;

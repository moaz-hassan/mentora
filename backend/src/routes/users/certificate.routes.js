

import express from "express";
import * as certificateController from "../../controllers/users/certificate.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.post(
  "/generate",
  authenticate,
  certificateController.generateCertificate
);


router.get(
  "/my",
  authenticate,
  certificateController.getMyCertificates
);


router.get(
  "/check/:courseId",
  authenticate,
  certificateController.checkCertificateExists
);


router.get(
  "/:id/verify",
  certificateController.verifyCertificate
);


router.get(
  "/:id/download",
  authenticate,
  certificateController.downloadCertificate
);


router.get(
  "/:id",
  authenticate,
  certificateController.getCertificateById
);


router.get(
  "/",
  authenticate,
  authorize("admin"),
  certificateController.getAllCertificates
);

export default router;

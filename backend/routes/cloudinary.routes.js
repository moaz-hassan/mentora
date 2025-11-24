import express from 'express';
import * as cloudinaryController from '../controllers/cloudinary.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
  '/video-signature',
  authenticate,
  cloudinaryController.getVideoUploadSignature
);

router.post(
  '/image-signature',
  authenticate,
  cloudinaryController.getImageUploadSignature
);

export default router;
import express from "express";
import multer from "multer";
import { uploadMaterial } from "../../controllers/media/materialUpload.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
});


router.use(authenticate);


router.post("/upload", upload.single("file"), uploadMaterial);

export default router;


import express from "express";
import * as marketingController from "../../controllers/admin/marketing.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();


router.get("/campaigns", marketingController.getAllCampaigns);


router.get("/campaigns/:id", marketingController.getCampaignById);


router.post(
  "/campaigns",
  body("name").trim().notEmpty().withMessage("Campaign name is required"),
  body("campaign_type").trim().notEmpty().withMessage("Campaign type is required"),
  validateResult,
  marketingController.createCampaign
);


router.put("/campaigns/:id", marketingController.updateCampaign);


router.delete("/campaigns/:id", marketingController.deleteCampaign);


router.get("/campaigns/:id/analytics", marketingController.getCampaignAnalytics);


router.patch("/campaigns/:id/metrics", marketingController.updateCampaignMetrics);


router.get("/featured-courses", marketingController.getAllFeaturedCourses);


router.post(
  "/featured-courses",
  body("course_id").notEmpty().withMessage("Course ID is required"),
  validateResult,
  marketingController.addFeaturedCourse
);


router.put("/featured-courses/:id", marketingController.updateFeaturedCourse);


router.delete("/featured-courses/:id", marketingController.removeFeaturedCourse);

export default router;

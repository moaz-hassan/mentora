/**
 * Admin Marketing Routes
 */
import express from "express";
import * as marketingController from "../../controllers/admin/marketing.controller.js";
import { validateResult } from "../../middlewares/validateResult.middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Get all campaigns
router.get("/campaigns", marketingController.getAllCampaigns);

// Get campaign by ID
router.get("/campaigns/:id", marketingController.getCampaignById);

// Create campaign
router.post(
  "/campaigns",
  body("name").trim().notEmpty().withMessage("Campaign name is required"),
  body("campaign_type").trim().notEmpty().withMessage("Campaign type is required"),
  validateResult,
  marketingController.createCampaign
);

// Update campaign
router.put("/campaigns/:id", marketingController.updateCampaign);

// Delete campaign
router.delete("/campaigns/:id", marketingController.deleteCampaign);

// Get campaign analytics
router.get("/campaigns/:id/analytics", marketingController.getCampaignAnalytics);

// Update campaign metrics
router.patch("/campaigns/:id/metrics", marketingController.updateCampaignMetrics);

// Get all featured courses
router.get("/featured-courses", marketingController.getAllFeaturedCourses);

// Add featured course
router.post(
  "/featured-courses",
  body("course_id").notEmpty().withMessage("Course ID is required"),
  validateResult,
  marketingController.addFeaturedCourse
);

// Update featured course
router.put("/featured-courses/:id", marketingController.updateFeaturedCourse);

// Remove featured course
router.delete("/featured-courses/:id", marketingController.removeFeaturedCourse);

export default router;

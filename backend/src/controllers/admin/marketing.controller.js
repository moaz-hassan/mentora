/**
 * Marketing Controller
 * Purpose: Handle marketing campaign and featured course route handlers
 */

import * as marketingService from "../../services/admin/marketing.service.js";

/**
 * Get all campaigns
 * GET /api/admin/marketing/campaigns
 */
export const getAllCampaigns = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      campaignType: req.query.type,
      targetAudience: req.query.audience,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const campaigns = await marketingService.getAllCampaigns(filters);

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign by ID
 * GET /api/admin/marketing/campaigns/:id
 */
export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await marketingService.getCampaignById(req.params.id);

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new campaign
 * POST /api/admin/marketing/campaigns
 */
export const createCampaign = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const campaign = await marketingService.createCampaign(req.body, adminId);

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update campaign
 * PUT /api/admin/marketing/campaigns/:id
 */
export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await marketingService.updateCampaign(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete campaign
 * DELETE /api/admin/marketing/campaigns/:id
 */
export const deleteCampaign = async (req, res, next) => {
  try {
    const result = await marketingService.deleteCampaign(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign analytics
 * GET /api/admin/marketing/campaigns/:id/analytics
 */
export const getCampaignAnalytics = async (req, res, next) => {
  try {
    const analytics = await marketingService.getCampaignAnalytics(req.params.id);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all featured courses
 * GET /api/admin/marketing/featured-courses
 */
export const getAllFeaturedCourses = async (req, res, next) => {
  try {
    const filters = {
      isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
      campaignId: req.query.campaignId
    };

    const featuredCourses = await marketingService.getAllFeaturedCourses(filters);

    res.status(200).json({
      success: true,
      count: featuredCourses.length,
      data: featuredCourses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add featured course
 * POST /api/admin/marketing/featured-courses
 */
export const addFeaturedCourse = async (req, res, next) => {
  try {
    const featuredCourse = await marketingService.addFeaturedCourse(req.body);

    res.status(201).json({
      success: true,
      message: "Featured course added successfully",
      data: featuredCourse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update featured course
 * PUT /api/admin/marketing/featured-courses/:id
 */
export const updateFeaturedCourse = async (req, res, next) => {
  try {
    const featuredCourse = await marketingService.updateFeaturedCourse(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Featured course updated successfully",
      data: featuredCourse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove featured course
 * DELETE /api/admin/marketing/featured-courses/:id
 */
export const removeFeaturedCourse = async (req, res, next) => {
  try {
    const result = await marketingService.removeFeaturedCourse(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update campaign metrics
 * PATCH /api/admin/marketing/campaigns/:id/metrics
 */
export const updateCampaignMetrics = async (req, res, next) => {
  try {
    const campaign = await marketingService.updateCampaignMetrics(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Campaign metrics updated successfully",
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

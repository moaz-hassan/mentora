

import models from "../../models/index.js";
import { Op } from "sequelize";

const { Campaign, FeaturedCourse, Course, User, Enrollment, Payment } = models;


export const getAllCampaigns = async (filters = {}) => {
  const whereClause = {};

  if (filters.status) whereClause.status = filters.status;
  if (filters.campaignType) whereClause.campaign_type = filters.campaignType;
  if (filters.targetAudience) whereClause.target_audience = filters.targetAudience;

  
  if (filters.startDate || filters.endDate) {
    whereClause.start_date = {};
    if (filters.startDate) whereClause.start_date[Op.gte] = new Date(filters.startDate);
    if (filters.endDate) whereClause.start_date[Op.lte] = new Date(filters.endDate);
  }

  const campaigns = await Campaign.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "Creator",
        attributes: ["id", "first_name", "last_name", "email"]
      }
    ],
    order: [["created_at", "DESC"]]
  });

  return campaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    type: campaign.campaign_type,
    status: campaign.status,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    targetAudience: campaign.target_audience,
    bannerImageUrl: campaign.banner_image_url,
    bannerLink: campaign.banner_link,
    metrics: {
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      revenueGenerated: parseFloat(campaign.revenue_generated || 0),
      clickThroughRate: campaign.impressions > 0 
        ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
        : 0,
      conversionRate: campaign.clicks > 0
        ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
        : 0
    },
    creator: campaign.Creator ? {
      id: campaign.Creator.id,
      name: `${campaign.Creator.first_name} ${campaign.Creator.last_name}`
    } : null,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at
  }));
};


export const getCampaignById = async (campaignId) => {
  const campaign = await Campaign.findByPk(campaignId, {
    include: [
      {
        model: User,
        as: "Creator",
        attributes: ["id", "first_name", "last_name", "email"]
      },
      {
        model: FeaturedCourse,
        include: [
          {
            model: Course,
            attributes: ["id", "title", "price", "thumbnail_url"]
          }
        ]
      }
    ]
  });

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    type: campaign.campaign_type,
    status: campaign.status,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    targetAudience: campaign.target_audience,
    bannerImageUrl: campaign.banner_image_url,
    bannerLink: campaign.banner_link,
    metrics: {
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      revenueGenerated: parseFloat(campaign.revenue_generated || 0),
      clickThroughRate: campaign.impressions > 0 
        ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
        : 0,
      conversionRate: campaign.clicks > 0
        ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
        : 0
    },
    featuredCourses: campaign.FeaturedCourses?.map(fc => ({
      id: fc.id,
      courseId: fc.course_id,
      courseTitle: fc.Course?.title,
      coursePrice: fc.Course?.price,
      courseThumbnail: fc.Course?.thumbnail_url,
      displayOrder: fc.display_order,
      isActive: fc.is_active,
      featuredUntil: fc.featured_until
    })) || [],
    creator: campaign.Creator ? {
      id: campaign.Creator.id,
      name: `${campaign.Creator.first_name} ${campaign.Creator.last_name}`
    } : null,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at
  };
};


export const createCampaign = async (campaignData, adminId) => {
  
  if (campaignData.startDate && campaignData.endDate) {
    if (new Date(campaignData.startDate) > new Date(campaignData.endDate)) {
      const error = new Error("Start date must be before end date");
      error.statusCode = 400;
      throw error;
    }
  }

  const campaign = await Campaign.create({
    name: campaignData.name,
    description: campaignData.description,
    campaign_type: campaignData.type,
    status: campaignData.status || "draft",
    start_date: campaignData.startDate,
    end_date: campaignData.endDate,
    target_audience: campaignData.targetAudience || "all",
    banner_image_url: campaignData.bannerImageUrl,
    banner_link: campaignData.bannerLink,
    created_by: adminId
  });

  return campaign;
};


export const updateCampaign = async (campaignId, updateData) => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  
  const startDate = updateData.startDate || campaign.start_date;
  const endDate = updateData.endDate || campaign.end_date;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    const error = new Error("Start date must be before end date");
    error.statusCode = 400;
    throw error;
  }

  await campaign.update({
    name: updateData.name,
    description: updateData.description,
    campaign_type: updateData.type,
    status: updateData.status,
    start_date: updateData.startDate,
    end_date: updateData.endDate,
    target_audience: updateData.targetAudience,
    banner_image_url: updateData.bannerImageUrl,
    banner_link: updateData.bannerLink
  });

  return campaign;
};


export const deleteCampaign = async (campaignId) => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  
  await FeaturedCourse.destroy({ where: { campaign_id: campaignId } });

  await campaign.destroy();

  return { message: "Campaign deleted successfully" };
};


export const getCampaignAnalytics = async (campaignId) => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  
  const featuredCourses = await FeaturedCourse.findAll({
    where: { campaign_id: campaignId },
    include: [
      {
        model: Course,
        attributes: ["id", "title"]
      }
    ]
  });

  const courseIds = featuredCourses.map(fc => fc.course_id);

  
  const enrollmentWhere = { course_id: courseIds };
  if (campaign.start_date) {
    enrollmentWhere.enrolled_at = { [Op.gte]: campaign.start_date };
  }
  if (campaign.end_date) {
    if (enrollmentWhere.enrolled_at) {
      enrollmentWhere.enrolled_at[Op.lte] = campaign.end_date;
    } else {
      enrollmentWhere.enrolled_at = { [Op.lte]: campaign.end_date };
    }
  }

  const enrollments = await Enrollment.count({ where: enrollmentWhere });

  
  const paymentWhere = { 
    course_id: courseIds,
    status: "completed"
  };
  if (campaign.start_date) {
    paymentWhere.created_at = { [Op.gte]: campaign.start_date };
  }
  if (campaign.end_date) {
    if (paymentWhere.created_at) {
      paymentWhere.created_at[Op.lte] = campaign.end_date;
    } else {
      paymentWhere.created_at = { [Op.lte]: campaign.end_date };
    }
  }

  const revenue = await Payment.sum("amount", { where: paymentWhere });

  
  const coursePerformance = await Promise.all(
    featuredCourses.map(async (fc) => {
      const courseEnrollments = await Enrollment.count({
        where: {
          course_id: fc.course_id,
          ...(campaign.start_date && { enrolled_at: { [Op.gte]: campaign.start_date } }),
          ...(campaign.end_date && { enrolled_at: { [Op.lte]: campaign.end_date } })
        }
      });

      const courseRevenue = await Payment.sum("amount", {
        where: {
          course_id: fc.course_id,
          status: "completed",
          ...(campaign.start_date && { created_at: { [Op.gte]: campaign.start_date } }),
          ...(campaign.end_date && { created_at: { [Op.lte]: campaign.end_date } })
        }
      });

      return {
        courseId: fc.course_id,
        courseTitle: fc.Course?.title,
        enrollments: courseEnrollments,
        revenue: parseFloat(courseRevenue || 0)
      };
    })
  );

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: campaign.status,
    period: {
      startDate: campaign.start_date,
      endDate: campaign.end_date
    },
    metrics: {
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      enrollments,
      revenue: parseFloat(revenue || 0),
      clickThroughRate: campaign.impressions > 0 
        ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
        : 0,
      conversionRate: campaign.clicks > 0
        ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
        : 0,
      roi: campaign.revenue_generated > 0 
        ? ((parseFloat(revenue || 0) / campaign.revenue_generated) * 100).toFixed(2)
        : 0
    },
    coursePerformance
  };
};


export const getAllFeaturedCourses = async (filters = {}) => {
  const whereClause = {};

  if (filters.isActive !== undefined) whereClause.is_active = filters.isActive;
  if (filters.campaignId) whereClause.campaign_id = filters.campaignId;

  const featuredCourses = await FeaturedCourse.findAll({
    where: whereClause,
    include: [
      {
        model: Course,
        attributes: ["id", "title", "price", "thumbnail_url", "instructor_id"],
        include: [
          {
            model: User,
            as: "Instructor",
            attributes: ["id", "first_name", "last_name"]
          }
        ]
      },
      {
        model: Campaign,
        attributes: ["id", "name", "status"]
      }
    ],
    order: [["display_order", "ASC"]]
  });

  return featuredCourses.map(fc => ({
    id: fc.id,
    courseId: fc.course_id,
    courseTitle: fc.Course?.title,
    coursePrice: fc.Course?.price,
    courseThumbnail: fc.Course?.thumbnail_url,
    instructor: fc.Course?.Instructor ? {
      id: fc.Course.Instructor.id,
      name: `${fc.Course.Instructor.first_name} ${fc.Course.Instructor.last_name}`
    } : null,
    campaign: fc.Campaign ? {
      id: fc.Campaign.id,
      name: fc.Campaign.name,
      status: fc.Campaign.status
    } : null,
    displayOrder: fc.display_order,
    isActive: fc.is_active,
    featuredUntil: fc.featured_until,
    createdAt: fc.created_at
  }));
};


export const addFeaturedCourse = async (featuredData) => {
  
  const course = await Course.findByPk(featuredData.courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  
  const existing = await FeaturedCourse.findOne({
    where: {
      course_id: featuredData.courseId,
      is_active: true
    }
  });

  if (existing) {
    const error = new Error("Course is already featured");
    error.statusCode = 400;
    throw error;
  }

  const featuredCourse = await FeaturedCourse.create({
    course_id: featuredData.courseId,
    campaign_id: featuredData.campaignId || null,
    display_order: featuredData.displayOrder || 0,
    is_active: true,
    featured_until: featuredData.featuredUntil || null
  });

  return featuredCourse;
};


export const updateFeaturedCourse = async (featuredCourseId, updateData) => {
  const featuredCourse = await FeaturedCourse.findByPk(featuredCourseId);

  if (!featuredCourse) {
    const error = new Error("Featured course not found");
    error.statusCode = 404;
    throw error;
  }

  await featuredCourse.update({
    display_order: updateData.displayOrder,
    is_active: updateData.isActive,
    featured_until: updateData.featuredUntil
  });

  return featuredCourse;
};


export const removeFeaturedCourse = async (featuredCourseId) => {
  const featuredCourse = await FeaturedCourse.findByPk(featuredCourseId);

  if (!featuredCourse) {
    const error = new Error("Featured course not found");
    error.statusCode = 404;
    throw error;
  }

  await featuredCourse.destroy();

  return { message: "Featured course removed successfully" };
};


export const updateCampaignMetrics = async (campaignId, metrics) => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  if (metrics.impressions !== undefined) {
    campaign.impressions += metrics.impressions;
  }
  if (metrics.clicks !== undefined) {
    campaign.clicks += metrics.clicks;
  }
  if (metrics.conversions !== undefined) {
    campaign.conversions += metrics.conversions;
  }
  if (metrics.revenue !== undefined) {
    campaign.revenue_generated = parseFloat(campaign.revenue_generated || 0) + parseFloat(metrics.revenue);
  }

  await campaign.save();

  return campaign;
};

import {
  Campaign,
  FeaturedCourse,
  Course,
  User,
  Enrollment,
  Payment
} from "../../models/index.js";

export const getAllCampaigns = async (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.campaignType) query.campaign_type = filters.campaignType;
  if (filters.targetAudience) query.target_audience = filters.targetAudience;

  if (filters.startDate || filters.endDate) {
    query.start_date = {};
    if (filters.startDate) query.start_date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.start_date.$lte = new Date(filters.endDate);
  }

  const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).lean();

  return await Promise.all(
    campaigns.map(async (campaign) => {
      let creator = null;
      if (campaign.created_by) {
        const u = await User.findById(campaign.created_by).select("first_name last_name email").lean();
        if (u) {
          creator = {
            id: u._id.toString(),
            name: `${u.first_name} ${u.last_name}`
          };
        }
      }

      const impressions = campaign.impressions || 0;
      const clicks = campaign.clicks || 0;
      const conversions = campaign.conversions || 0;

      return {
        id: campaign._id.toString(),
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
          impressions,
          clicks,
          conversions,
          revenueGenerated: parseFloat(campaign.revenue_generated || 0),
          clickThroughRate: impressions > 0
            ? ((clicks / impressions) * 100).toFixed(2)
            : 0,
          conversionRate: clicks > 0
            ? ((conversions / clicks) * 100).toFixed(2)
            : 0
        },
        creator,
        createdAt: campaign.createdAt || campaign.created_at,
        updatedAt: campaign.updatedAt || campaign.updated_at
      };
    })
  );
};

export const getCampaignById = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId).lean();

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  let creator = null;
  if (campaign.created_by) {
    const u = await User.findById(campaign.created_by).select("first_name last_name email").lean();
    if (u) {
      creator = {
        id: u._id.toString(),
        name: `${u.first_name} ${u.last_name}`
      };
    }
  }

  const featuredList = await FeaturedCourse.find({ campaign_id: campaignId }).lean();
  const featuredCourses = await Promise.all(
    featuredList.map(async (fc) => {
      const c = await Course.findById(fc.course_id).select("title price thumbnail_url").lean();
      return {
        id: fc._id.toString(),
        courseId: fc.course_id,
        courseTitle: c?.title,
        coursePrice: c?.price,
        courseThumbnail: c?.thumbnail_url,
        displayOrder: fc.display_order,
        isActive: fc.is_active,
        featuredUntil: fc.featured_until
      };
    })
  );

  const impressions = campaign.impressions || 0;
  const clicks = campaign.clicks || 0;
  const conversions = campaign.conversions || 0;

  return {
    id: campaign._id.toString(),
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
      impressions,
      clicks,
      conversions,
      revenueGenerated: parseFloat(campaign.revenue_generated || 0),
      clickThroughRate: impressions > 0
        ? ((clicks / impressions) * 100).toFixed(2)
        : 0,
      conversionRate: clicks > 0
        ? ((conversions / clicks) * 100).toFixed(2)
        : 0
    },
    featuredCourses,
    creator,
    createdAt: campaign.createdAt || campaign.created_at,
    updatedAt: campaign.updatedAt || campaign.updated_at
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
  const campaign = await Campaign.findById(campaignId);

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

  if (updateData.name !== undefined) campaign.name = updateData.name;
  if (updateData.description !== undefined) campaign.description = updateData.description;
  if (updateData.type !== undefined) campaign.campaign_type = updateData.type;
  if (updateData.status !== undefined) campaign.status = updateData.status;
  if (updateData.startDate !== undefined) campaign.start_date = updateData.startDate;
  if (updateData.endDate !== undefined) campaign.end_date = updateData.endDate;
  if (updateData.targetAudience !== undefined) campaign.target_audience = updateData.targetAudience;
  if (updateData.bannerImageUrl !== undefined) campaign.banner_image_url = updateData.bannerImageUrl;
  if (updateData.bannerLink !== undefined) campaign.banner_link = updateData.bannerLink;

  await campaign.save();
  return campaign;
};

export const deleteCampaign = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  await FeaturedCourse.deleteMany({ campaign_id: campaignId });
  await Campaign.findByIdAndDelete(campaignId);

  return { message: "Campaign deleted successfully" };
};

export const getCampaignAnalytics = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId).lean();

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  const featuredCourses = await FeaturedCourse.find({ campaign_id: campaignId }).lean();
  const courseIds = featuredCourses.map(fc => fc.course_id);

  const enrollmentQuery = { course_id: { $in: courseIds } };
  if (campaign.start_date || campaign.end_date) {
    enrollmentQuery.createdAt = {};
    if (campaign.start_date) enrollmentQuery.createdAt.$gte = new Date(campaign.start_date);
    if (campaign.end_date) enrollmentQuery.createdAt.$lte = new Date(campaign.end_date);
  }

  const enrollments = await Enrollment.countDocuments(enrollmentQuery);

  const paymentQuery = {
    course_id: { $in: courseIds },
    status: "completed"
  };
  if (campaign.start_date || campaign.end_date) {
    paymentQuery.createdAt = {};
    if (campaign.start_date) paymentQuery.createdAt.$gte = new Date(campaign.start_date);
    if (campaign.end_date) paymentQuery.createdAt.$lte = new Date(campaign.end_date);
  }

  const [payAgg] = await Payment.aggregate([
    { $match: paymentQuery },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  const revenue = payAgg?.totalRevenue || 0;

  const coursePerformance = await Promise.all(
    featuredCourses.map(async (fc) => {
      const course = await Course.findById(fc.course_id).select("title").lean();

      const cEnrQuery = { course_id: fc.course_id };
      if (campaign.start_date || campaign.end_date) {
        cEnrQuery.createdAt = {};
        if (campaign.start_date) cEnrQuery.createdAt.$gte = new Date(campaign.start_date);
        if (campaign.end_date) cEnrQuery.createdAt.$lte = new Date(campaign.end_date);
      }
      const courseEnrollments = await Enrollment.countDocuments(cEnrQuery);

      const cPayQuery = { course_id: fc.course_id, status: "completed" };
      if (campaign.start_date || campaign.end_date) {
        cPayQuery.createdAt = {};
        if (campaign.start_date) cPayQuery.createdAt.$gte = new Date(campaign.start_date);
        if (campaign.end_date) cPayQuery.createdAt.$lte = new Date(campaign.end_date);
      }
      const [cPayAgg] = await Payment.aggregate([
        { $match: cPayQuery },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
      ]);
      const courseRevenue = cPayAgg?.totalRevenue || 0;

      return {
        courseId: fc.course_id,
        courseTitle: course?.title,
        enrollments: courseEnrollments,
        revenue: parseFloat(courseRevenue)
      };
    })
  );

  const impressions = campaign.impressions || 0;
  const clicks = campaign.clicks || 0;
  const conversions = campaign.conversions || 0;

  return {
    campaignId: campaign._id.toString(),
    campaignName: campaign.name,
    status: campaign.status,
    period: {
      startDate: campaign.start_date,
      endDate: campaign.end_date
    },
    metrics: {
      impressions,
      clicks,
      conversions,
      enrollments,
      revenue: parseFloat(revenue),
      clickThroughRate: impressions > 0
        ? ((clicks / impressions) * 100).toFixed(2)
        : 0,
      conversionRate: clicks > 0
        ? ((conversions / clicks) * 100).toFixed(2)
        : 0,
      roi: (campaign.revenue_generated || 0) > 0
        ? ((parseFloat(revenue) / campaign.revenue_generated) * 100).toFixed(2)
        : 0
    },
    coursePerformance
  };
};

export const getAllFeaturedCourses = async (filters = {}) => {
  const query = {};

  if (filters.isActive !== undefined) query.is_active = filters.isActive;
  if (filters.campaignId) query.campaign_id = filters.campaignId;

  const featuredCourses = await FeaturedCourse.find(query).sort({ display_order: 1 }).lean();

  return await Promise.all(
    featuredCourses.map(async (fc) => {
      const course = await Course.findById(fc.course_id).select("title price thumbnail_url instructor_id").lean();
      let instructor = null;
      if (course?.instructor_id) {
        const u = await User.findById(course.instructor_id).select("first_name last_name").lean();
        if (u) {
          instructor = {
            id: u._id.toString(),
            name: `${u.first_name} ${u.last_name}`
          };
        }
      }

      let campaign = null;
      if (fc.campaign_id) {
        const cmp = await Campaign.findById(fc.campaign_id).select("name status").lean();
        if (cmp) {
          campaign = {
            id: cmp._id.toString(),
            name: cmp.name,
            status: cmp.status
          };
        }
      }

      return {
        id: fc._id.toString(),
        courseId: fc.course_id,
        courseTitle: course?.title,
        coursePrice: course?.price,
        courseThumbnail: course?.thumbnail_url,
        instructor,
        campaign,
        displayOrder: fc.display_order,
        isActive: fc.is_active,
        featuredUntil: fc.featured_until,
        createdAt: fc.createdAt || fc.created_at
      };
    })
  );
};

export const addFeaturedCourse = async (featuredData) => {
  const course = await Course.findById(featuredData.courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const existing = await FeaturedCourse.findOne({
    course_id: featuredData.courseId,
    is_active: true
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
  const featuredCourse = await FeaturedCourse.findById(featuredCourseId);

  if (!featuredCourse) {
    const error = new Error("Featured course not found");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.displayOrder !== undefined) featuredCourse.display_order = updateData.displayOrder;
  if (updateData.isActive !== undefined) featuredCourse.is_active = updateData.isActive;
  if (updateData.featuredUntil !== undefined) featuredCourse.featured_until = updateData.featuredUntil;

  await featuredCourse.save();
  return featuredCourse;
};

export const removeFeaturedCourse = async (featuredCourseId) => {
  const featuredCourse = await FeaturedCourse.findById(featuredCourseId);

  if (!featuredCourse) {
    const error = new Error("Featured course not found");
    error.statusCode = 404;
    throw error;
  }

  await FeaturedCourse.findByIdAndDelete(featuredCourseId);
  return { message: "Featured course removed successfully" };
};

export const updateCampaignMetrics = async (campaignId, metrics) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  if (metrics.impressions !== undefined) {
    campaign.impressions = (campaign.impressions || 0) + metrics.impressions;
  }
  if (metrics.clicks !== undefined) {
    campaign.clicks = (campaign.clicks || 0) + metrics.clicks;
  }
  if (metrics.conversions !== undefined) {
    campaign.conversions = (campaign.conversions || 0) + metrics.conversions;
  }
  if (metrics.revenue !== undefined) {
    campaign.revenue_generated = parseFloat(campaign.revenue_generated || 0) + parseFloat(metrics.revenue);
  }

  await campaign.save();
  return campaign;
};

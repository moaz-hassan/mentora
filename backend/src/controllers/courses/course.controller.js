import * as courseService from "../../services/courses/course.service.js";
import geminiService from "../../services/ai/gemini.service.js";

export const getAllCourses = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      level: req.query.level,
      instructor_id: req.query.instructor_id,
    };

    const courses = await courseService.getAllCourses(filters);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    // Extract thumbnail file from multer
    const thumbnailFile = req.file;
    
    // Create course with thumbnail
    const course = await courseService.createCourse(
      req.body,
      thumbnailFile,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const result = await courseService.deleteCourse(
      req.params.id,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourseIntroVideo = async (req, res, next) => {
  try {
    const course = await courseService.updateCourseIntroVideo(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Introduction video updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save course as draft
 */
export const saveDraft = async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.user.id);
  try {
    const course = await courseService.saveDraft(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Course saved as draft",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit course for review
 */
export const submitForReview = async (req, res, next) => {
  try {
    const course = await courseService.submitForReview(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Course submitted for review",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze course with AI (Admin only)
 */
export const analyzeCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const analysis = await geminiService.analyzeCourseForReview(course);
    
    // Save analysis to course
    await course.update({ ai_analysis: analysis });

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve course (Admin only)
 */
export const approveCourse = async (req, res, next) => {
  try {
    const course = await courseService.approveCourse(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Course approved successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject course (Admin only)
 */
export const rejectCourse = async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;

    const course = await courseService.rejectCourse(
      req.params.id,
      req.user.id,
      rejection_reason
    );

    res.status(200).json({
      success: true,
      message: "Course rejected",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending courses (Admin only)
 */
export const getPendingCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getPendingCourses();

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enhanced course preview
 * GET /api/courses/:id/preview
 */
export const getCoursePreview = async (req, res, next) => {
  try {
    const preview = await courseService.getCoursePreview(req.params.id);
    
    res.status(200).json({
      success: true,
      data: preview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public curriculum
 * GET /api/courses/:id/curriculum
 */
export const getPublicCurriculum = async (req, res, next) => {
  try {
    const curriculum = await courseService.getPublicCurriculum(req.params.id);
    
    res.status(200).json({
      success: true,
      data: curriculum,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search and filter courses
 * GET /api/courses/search
 */
export const searchCourses = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      level: req.query.level,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sortBy: req.query.sortBy,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await courseService.searchCourses(filters);

    res.status(200).json({
      success: true,
      data: result.courses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 * GET /api/courses/categories
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await courseService.getAllCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured courses
 * GET /api/courses/featured
 */
export const getFeaturedCourses = async (req, res, next) => {
  try {
    const limit = req.query.limit || 6;
    const courses = await courseService.getFeaturedCourses(limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular courses
 * GET /api/courses/popular
 */
export const getPopularCourses = async (req, res, next) => {
  try {
    const limit = req.query.limit || 6;
    const courses = await courseService.getPopularCourses(limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

import * as courseService from "../../services/courses/course.service.js";
import geminiService from "../../services/ai/gemini.service.js";
import { setToCache } from "../../caching/cache.manager.js";

export const getAllCourses = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      level: req.query.level,
      instructor_id: req.query.instructor_id,
    };

    const courses = await courseService.getAllCourses(filters);

    const response = {
      success: true,
      count: courses.length,
      data: courses,
    };

    await setToCache(req, {count: courses.length,data: courses});

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAllFeaturedCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getAllFeaturedCourses();

    const response = {
      success: true,
      count: courses.length,
      data: courses,
    };
    
    await setToCache(req, {count: courses.length,data: courses});

    res.status(200).json(response);
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
    const thumbnailFile = req.file;
    
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


export const analyzeCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id, { includeNonApproved: true });
    
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const analysis = await geminiService.analyzeCourseForReview(course);
    
    
    await courseService.saveCourseAnalysis(req.params.id, analysis);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};


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


export const getAdminCourseDetails = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id, { includeNonApproved: true });
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};


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


export const searchCourses = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      subcategory: req.query.subcategory,
      level: req.query.level,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      priceType: req.query.priceType, 
      rating: req.query.rating, 
      language: req.query.language,
      sortBy: req.query.sortBy,
      page: req.query.page || 1,
      limit: req.query.limit || 12,
    };

    const result = await courseService.searchCourses(filters);

    const response = {
      success: true,
      courses: result.courses,
      page: result.page,
      perPage: result.perPage,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    };

    await setToCache(req, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};


export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await courseService.getAllCategories();

    const response = {
      success: true,
      data: categories,
    };

    await setToCache(req, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};


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

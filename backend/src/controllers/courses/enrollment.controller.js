import * as enrollmentService from "../../services/courses/enrollment.service.js";

export const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getAllEnrollments(req.user.id);
    
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.getEnrollmentById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const createEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.createEnrollment(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      data: {
        id: enrollment.id,
        enrolled_at: enrollment.enrolled_at,
        student_id: enrollment.student_id,
        course_id: enrollment.course_id
      },
    });
  } catch (error) {
    next(error);
  }
};

export const completeLesson = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.completeLesson(
      req.params.id,
      req.body.lesson_id,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: "Lesson completed successfully",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentPosition = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.updateCurrentPosition(
      req.params.id,
      req.body.lesson_id,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: "Position updated successfully",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify enrollment access
 * GET /api/enrollments/:enrollmentId/course/:courseId/access
 */
export const verifyAccess = async (req, res, next) => {
  try {
    const { enrollmentId, courseId } = req.params;
    const studentId = req.user.id;

    const result = await enrollmentService.verifyEnrollmentAccess(
      enrollmentId,
      courseId,
      studentId
    );

    res.status(200).json({
      success: true,
      message: "Access verified",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course player data
 * GET /api/enrollments/:enrollmentId/course/:courseId/player
 */
export const getCoursePlayerData = async (req, res, next) => {
  try {
    const { enrollmentId, courseId } = req.params;
    const studentId = req.user.id;

    const playerData = await enrollmentService.getCoursePlayerData(
      enrollmentId,
      courseId,
      studentId
    );

    res.status(200).json({
      success: true,
      data: playerData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student progress
 * GET /api/enrollments/:enrollmentId/progress
 */
export const getProgress = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const studentId = req.user.id;

    const progress = await enrollmentService.getProgress(enrollmentId, studentId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student progress
 * PUT /api/enrollments/:enrollmentId/progress
 */
export const updateProgress = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const studentId = req.user.id;
    const progressUpdate = req.body;

    const progress = await enrollmentService.updateProgress(
      enrollmentId,
      studentId,
      progressUpdate
    );

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark lesson as completed
 * POST /api/enrollments/:enrollmentId/lessons/:lessonId/complete
 */
export const markLessonComplete = async (req, res, next) => {
  try {
    const { enrollmentId, lessonId } = req.params;
    const studentId = req.user.id;

    const progress = await enrollmentService.markLessonComplete(
      enrollmentId,
      studentId,
      lessonId
    );

    res.status(200).json({
      success: true,
      message: "Lesson marked as complete",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

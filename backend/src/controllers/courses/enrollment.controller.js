import { setToCache } from "../../caching/cache.manager.js";
import { getRedisClient, isRedisAvailable } from "../../caching/redis.util.js";
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

export const checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const isEnrolled = await enrollmentService.checkEnrollment(
      courseId,
      studentId
    );

    res.status(200).json({
      success: true,
      isEnrolled,
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
    const enrollment = await enrollmentService.createEnrollment(
      req.body.course_id,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      data: {
        id: enrollment.id,
        enrolled_at: enrollment.enrolled_at,
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
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


export const getProgress = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const studentId = req.user.id;

    const progress = await enrollmentService.getProgress(
      enrollmentId,
      studentId
    );

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};


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


export const getLessonDetail = async (req, res, next) => {
  try {
    const { enrollmentId, lessonId } = req.params;
    const studentId = req.user.id;

    
    await enrollmentService.verifyEnrollmentAndUpdateProgress(
      enrollmentId,
      lessonId,
      studentId
    );

    
    let lesson = null;
    const cacheKey = `lesson:${lessonId}:content`;

    if (isRedisAvailable()) {
      const redis = getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        lesson = JSON.parse(cached);
      }
    }

    
    if (!lesson) {
      lesson = await enrollmentService.getLessonContent(lessonId);
      
      if (lesson && isRedisAvailable()) {
        const redis = getRedisClient();
        
        await redis.setex(cacheKey, 3600, JSON.stringify(lesson));
      }
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};


export const getQuizDetail = async (req, res, next) => {
  try {
    const { enrollmentId, quizId } = req.params;
    const studentId = req.user.id;

    const quiz = await enrollmentService.getQuizDetail(
      enrollmentId,
      quizId,
      studentId
    );

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};


export const submitQuiz = async (req, res, next) => {
  try {
    const { enrollmentId, quizId } = req.params;
    const studentId = req.user.id;
    const { answers } = req.body;

    const result = await enrollmentService.submitQuiz(
      enrollmentId,
      quizId,
      studentId,
      answers
    );

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const giftCourse = async (req, res, next) => {
  try {
    const { courseId, recipientEmail, personalMessage } = req.body;
    const senderId = req.user.id;

    const result = await enrollmentService.giftCourse(
      courseId,
      senderId,
      recipientEmail,
      personalMessage
    );

    res.status(201).json({
      success: true,
      message:
        "Course gifted successfully! An email has been sent to the recipient.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

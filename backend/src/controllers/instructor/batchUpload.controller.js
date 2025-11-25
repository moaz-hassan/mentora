/**
 * Batch Upload Controller
 * Purpose: Handle batch video upload route handlers
 * Routes: /api/courses/:courseId/batch-upload
 */

import * as batchUploadService from "../../services/instructor/batchUpload.service.js";

/**
 * Initialize batch upload session
 * POST /api/courses/:courseId/batch-upload/init
 */
export const initBatchUpload = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonIds } = req.body;
    const instructorId = req.user.id;

    if (!lessonIds || !Array.isArray(lessonIds) || lessonIds.length === 0) {
      const error = new Error("lessonIds array is required");
      error.statusCode = 400;
      throw error;
    }

    const session = await batchUploadService.initBatchUpload(
      courseId,
      instructorId,
      lessonIds
    );

    res.status(201).json({
      success: true,
      message: "Batch upload session initialized",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload single video in batch
 * POST /api/courses/:courseId/batch-upload/video
 */
export const uploadVideo = async (req, res, next) => {
  try {
    const { sessionId, lessonId } = req.body;
    const instructorId = req.user.id;

    if (!sessionId || !lessonId) {
      const error = new Error("sessionId and lessonId are required");
      error.statusCode = 400;
      throw error;
    }

    if (!req.file) {
      const error = new Error("Video file is required");
      error.statusCode = 400;
      throw error;
    }

    const result = await batchUploadService.uploadVideoInBatch(
      sessionId,
      lessonId,
      req.file,
      instructorId
    );

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.data,
      error: result.error || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete batch upload session
 * POST /api/courses/:courseId/batch-upload/complete
 */
export const completeBatchUpload = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const instructorId = req.user.id;

    if (!sessionId) {
      const error = new Error("sessionId is required");
      error.statusCode = 400;
      throw error;
    }

    const summary = await batchUploadService.completeBatchUpload(
      sessionId,
      instructorId
    );

    res.status(200).json({
      success: true,
      message: "Batch upload completed",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel batch upload session
 * DELETE /api/courses/:courseId/batch-upload/cancel
 */
export const cancelBatchUpload = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const instructorId = req.user.id;

    if (!sessionId) {
      const error = new Error("sessionId is required");
      error.statusCode = 400;
      throw error;
    }

    const result = await batchUploadService.cancelBatchUpload(
      sessionId,
      instructorId
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session status
 * GET /api/courses/:courseId/batch-upload/status/:sessionId
 */
export const getSessionStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const instructorId = req.user.id;

    const status = await batchUploadService.getSessionStatus(
      sessionId,
      instructorId
    );

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

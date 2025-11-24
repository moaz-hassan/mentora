import * as chapterService from "../services/chapter.service.js";


export const createChapter = async (req, res, next) => {
  try {
    const chapter = await chapterService.createChapter(req.body , req.user.id);
    
    res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChapter = async (req, res, next) => {
  try {
    const chapter = await chapterService.updateChapter(req.params.id, req.body , req.user.id);
    
    res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChapter = async (req, res, next) => {
  try {
    const result = await chapterService.deleteChapter(req.params.id , req.user.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve chapter (Admin only)
 */
export const approveChapter = async (req, res, next) => {
  try {
    const chapter = await chapterService.approveChapter(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Chapter approved successfully",
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject chapter (Admin only)
 */
export const rejectChapter = async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;

    const chapter = await chapterService.rejectChapter(
      req.params.id,
      req.user.id,
      rejection_reason
    );

    res.status(200).json({
      success: true,
      message: "Chapter rejected",
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending chapters (Admin only)
 */
export const getPendingChapters = async (req, res, next) => {
  try {
    const chapters = await chapterService.getPendingChapters();

    res.status(200).json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

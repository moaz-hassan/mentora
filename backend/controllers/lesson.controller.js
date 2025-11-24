import * as lessonService from "../services/lesson.service.js";


export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const createLesson = async (req, res, next) => {
  try {
    // Create lesson with video URL (video already uploaded to Cloudinary from frontend)
    const lesson = await lessonService.createLesson(
      req.body,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
  
    
    const lesson = await lessonService.updateLesson(req.params.id, req.body,req.user.id);
    
    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const result = await lessonService.deleteLesson(req.params.id,req.user.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

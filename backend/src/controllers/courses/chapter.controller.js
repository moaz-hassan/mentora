import * as chapterService from "../../services/courses/chapter.service.js";


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



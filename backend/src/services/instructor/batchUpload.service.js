

import models from "../../models/index.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary.util.js";

const { BatchUploadSession, Course, Lesson } = models;


export const initBatchUpload = async (courseId, instructorId, lessonIds) => {
  
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  if (course.instructor_id !== instructorId) {
    const error = new Error("You do not have permission to upload to this course");
    error.statusCode = 403;
    throw error;
  }

  
  const lessons = await Lesson.findAll({
    where: { id: lessonIds },
    include: [
      {
        model: models.Chapter,
        where: { course_id: courseId },
        required: true,
      },
    ],
  });

  if (lessons.length !== lessonIds.length) {
    const error = new Error("Some lessons not found or do not belong to this course");
    error.statusCode = 400;
    throw error;
  }

  
  const session = await BatchUploadSession.create({
    course_id: courseId,
    instructor_id: instructorId,
    total_videos: lessonIds.length,
    uploaded_count: 0,
    failed_count: 0,
    status: "in_progress",
    upload_data: lessonIds.map((lessonId) => ({
      lessonId,
      status: "pending",
      videoUrl: null,
      publicId: null,
      error: null,
      retryCount: 0,
    })),
  });

  return session;
};


export const uploadVideoInBatch = async (
  sessionId,
  lessonId,
  videoFile,
  instructorId
) => {
  
  const session = await BatchUploadSession.findByPk(sessionId);

  if (!session) {
    const error = new Error("Upload session not found");
    error.statusCode = 404;
    throw error;
  }

  
  if (session.instructor_id !== instructorId) {
    const error = new Error("You do not have permission to access this upload session");
    error.statusCode = 403;
    throw error;
  }

  
  if (session.status !== "in_progress") {
    const error = new Error("Upload session is not active");
    error.statusCode = 400;
    throw error;
  }

  
  const uploadData = session.upload_data;
  const lessonIndex = uploadData.findIndex((item) => item.lessonId === lessonId);

  if (lessonIndex === -1) {
    const error = new Error("Lesson not found in upload session");
    error.statusCode = 400;
    throw error;
  }

  const lessonUploadData = uploadData[lessonIndex];

  
  if (lessonUploadData.status === "completed") {
    return {
      success: true,
      message: "Video already uploaded",
      data: lessonUploadData,
    };
  }

  
  const maxRetries = 3;
  let uploadSuccess = false;
  let uploadResult = null;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      
      uploadResult = await uploadToCloudinary(
        videoFile.buffer,
        `courses/${session.course_id}/lessons`,
        "video"
      );

      uploadSuccess = true;
      break;
    } catch (error) {
      lastError = error;
      lessonUploadData.retryCount = attempt + 1;
      
      console.error(`Upload attempt ${attempt + 1} failed for lesson ${lessonId}:`, error.message);

      
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1))); 
      }
    }
  }

  if (uploadSuccess && uploadResult) {
    
    await Lesson.update(
      {
        video_url: uploadResult.secure_url,
        video_public_id: uploadResult.public_id,
        hls_url: uploadResult.playback_url || null,
        duration: uploadResult.duration || 0,
      },
      { where: { id: lessonId } }
    );

    
    lessonUploadData.status = "completed";
    lessonUploadData.videoUrl = uploadResult.secure_url;
    lessonUploadData.publicId = uploadResult.public_id;
    lessonUploadData.error = null;

    
    await session.update({
      uploaded_count: session.uploaded_count + 1,
      upload_data: uploadData,
    });

    return {
      success: true,
      message: "Video uploaded successfully",
      data: lessonUploadData,
    };
  } else {
    
    lessonUploadData.status = "failed";
    lessonUploadData.error = lastError ? lastError.message : "Upload failed";

    
    await session.update({
      failed_count: session.failed_count + 1,
      upload_data: uploadData,
    });

    return {
      success: false,
      message: "Video upload failed after retries",
      data: lessonUploadData,
      error: lastError ? lastError.message : "Upload failed",
    };
  }
};


export const completeBatchUpload = async (sessionId, instructorId) => {
  const session = await BatchUploadSession.findByPk(sessionId);

  if (!session) {
    const error = new Error("Upload session not found");
    error.statusCode = 404;
    throw error;
  }

  if (session.instructor_id !== instructorId) {
    const error = new Error("You do not have permission to access this upload session");
    error.statusCode = 403;
    throw error;
  }

  
  const processingTime = new Date() - new Date(session.started_at);
  const processingTimeSeconds = Math.round(processingTime / 1000);

  
  await session.update({
    status: "completed",
    completed_at: new Date(),
  });

  
  const summary = {
    session_id: session.id,
    total_videos: session.total_videos,
    uploaded_count: session.uploaded_count,
    failed_count: session.failed_count,
    processing_time_seconds: processingTimeSeconds,
    started_at: session.started_at,
    completed_at: session.completed_at,
    upload_details: session.upload_data,
  };

  return summary;
};


export const cancelBatchUpload = async (sessionId, instructorId) => {
  const session = await BatchUploadSession.findByPk(sessionId);

  if (!session) {
    const error = new Error("Upload session not found");
    error.statusCode = 404;
    throw error;
  }

  if (session.instructor_id !== instructorId) {
    const error = new Error("You do not have permission to access this upload session");
    error.statusCode = 403;
    throw error;
  }

  
  await session.update({
    status: "cancelled",
    completed_at: new Date(),
  });

  return {
    message: "Upload session cancelled",
    uploaded_count: session.uploaded_count,
    failed_count: session.failed_count,
    upload_data: session.upload_data,
  };
};


export const getSessionStatus = async (sessionId, instructorId) => {
  const session = await BatchUploadSession.findByPk(sessionId);

  if (!session) {
    const error = new Error("Upload session not found");
    error.statusCode = 404;
    throw error;
  }

  if (session.instructor_id !== instructorId) {
    const error = new Error("You do not have permission to access this upload session");
    error.statusCode = 403;
    throw error;
  }

  return {
    session_id: session.id,
    course_id: session.course_id,
    status: session.status,
    total_videos: session.total_videos,
    uploaded_count: session.uploaded_count,
    failed_count: session.failed_count,
    started_at: session.started_at,
    completed_at: session.completed_at,
    upload_data: session.upload_data,
  };
};

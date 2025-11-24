import multer from 'multer';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

/**
 * Allowed MIME types for security
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

/**
 * File filter function to validate file types with strict security
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Accept images for thumbnail field
  if (file.fieldname === 'thumbnail') {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      // Additional security: check file extension
      const ext = file.originalname.toLowerCase().split('.').pop();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (validExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid image file extension'), false);
      }
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for thumbnails'), false);
    }
  }
  // Accept videos for video field
  else if (file.fieldname === 'video') {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      // Additional security: check file extension
      const ext = file.originalname.toLowerCase().split('.').pop();
      const validExtensions = ['mp4', 'mpeg', 'mov', 'avi', 'webm'];
      
      if (validExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid video file extension'), false);
      }
    } else {
      cb(new Error('Only video files (MP4, MPEG, MOV, AVI, WebM) are allowed'), false);
    }
  }
  // Reject any other fields
  else {
    cb(new Error('Unexpected file field'), false);
  }
};

/**
 * Multer configuration with security limits
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 1, // Only one file per request
    fields: 10, // Limit number of non-file fields
  },
  fileFilter: fileFilter,
});

/**
 * Multer configuration for thumbnails (smaller size limit)
 */
const uploadThumbnailConfig = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for images
    files: 1,
    fields: 10,
  },
  fileFilter: fileFilter,
});

/**
 * Middleware for uploading a single thumbnail image (with smaller size limit)
 */
export const uploadThumbnail = uploadThumbnailConfig.single('thumbnail');

/**
 * Middleware for uploading a single video file
 */
export const uploadVideo = upload.single('video');

/**
 * Middleware for uploading multiple files
 * Accepts both thumbnail and video in the same request
 */
export const uploadCourseFiles = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

/**
 * Error handling middleware for multer errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File size exceeds the maximum limit of 100MB',
          code: 'FILE_TOO_LARGE',
        },
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unexpected file field',
          code: 'UNEXPECTED_FILE',
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'UPLOAD_ERROR',
      },
    });
  } else if (err) {
    // Other errors (like file filter errors)
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'INVALID_FILE',
      },
    });
  }
  next();
};

export default upload;

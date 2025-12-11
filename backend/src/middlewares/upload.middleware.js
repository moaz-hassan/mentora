import multer from 'multer';


const storage = multer.memoryStorage();


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


const fileFilter = (req, file, cb) => {
  
  if (file.fieldname === 'thumbnail') {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      
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
  
  else if (file.fieldname === 'video') {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      
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
  
  else {
    cb(new Error('Unexpected file field'), false);
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, 
    files: 1, 
    fields: 10, 
  },
  fileFilter: fileFilter,
});


const uploadThumbnailConfig = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    files: 1,
    fields: 10,
  },
  fileFilter: fileFilter,
});


export const uploadThumbnail = uploadThumbnailConfig.single('thumbnail');


export const uploadVideo = upload.single('video');


export const uploadCourseFiles = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);


export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    
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

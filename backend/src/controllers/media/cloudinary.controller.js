import { v2 as cloudinary } from 'cloudinary';


export const getVideoUploadSignature = async (req, res, next) => {
  try {
    
    if (!req.user || (req.user.role !== 'instructor' && req.user.role !== 'admin')) {
      const error = new Error('Only instructors and admins can upload videos');
      error.statusCode = 403;
      throw error;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'courses/videos';

    
    const paramsToSign = {
      folder: folder,
      timestamp: timestamp,
    };

    
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        signature: signature,
        timestamp: timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: folder,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getImageUploadSignature = async (req, res, next) => {
  try {
    
    if (!req.user) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'profiles/avatars';

    
    const paramsToSign = {
      folder: folder,
      timestamp: timestamp,
    };

    
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        signature: signature,
        timestamp: timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: folder,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getMaterialUploadSignature = async (req, res, next) => {
  try {
    
    if (!req.user || (req.user.role !== 'instructor' && req.user.role !== 'admin')) {
      const error = new Error('Only instructors and admins can upload materials');
      error.statusCode = 403;
      throw error;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'course-materials';

    
    
    const paramsToSign = {
      folder: folder,
      timestamp: timestamp,
    };

    
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        signature: signature,
        timestamp: timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: folder,
        resourceType: 'raw', 
      },
    });
  } catch (error) {
    next(error);
  }
};


export const validateCloudinaryUrl = (url, publicId) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  
  if (!url.includes(`res.cloudinary.com/${cloudName}`)) {
    return false;
  }
  
  
  if (!publicId.startsWith('courses/videos/')) {
    return false;
  }
  
  return true;
};

import { v2 as cloudinary } from 'cloudinary';

/**
 * Generate a secure Cloudinary upload signature for video uploads
 * This allows frontend to upload directly to Cloudinary
 */
export const getVideoUploadSignature = async (req, res, next) => {
  try {
    // Verify user is authorized (instructor or admin)
    if (!req.user || (req.user.role !== 'instructor' && req.user.role !== 'admin')) {
      const error = new Error('Only instructors and admins can upload videos');
      error.statusCode = 403;
      throw error;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'courses/videos';

    // Parameters to sign - MUST match exactly what's sent to Cloudinary
    const paramsToSign = {
      folder: folder,
      timestamp: timestamp,
    };

    // Generate signature
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

/**
 * Generate a secure Cloudinary upload signature for image uploads
 * This allows frontend to upload directly to Cloudinary
 */
export const getImageUploadSignature = async (req, res, next) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'profiles/avatars';

    // Parameters to sign - MUST match exactly what's sent to Cloudinary
    const paramsToSign = {
      folder: folder,
      timestamp: timestamp,
    };

    // Generate signature
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

/**
 * Validate that a Cloudinary URL belongs to our account
 */
export const validateCloudinaryUrl = (url, publicId) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  // Check if URL is from our Cloudinary account
  if (!url.includes(`res.cloudinary.com/${cloudName}`)) {
    return false;
  }
  
  // Check if public_id is in the correct folder
  if (!publicId.startsWith('courses/videos/')) {
    return false;
  }
  
  return true;
};

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import crypto from 'crypto';

// Configure Cloudinary with security settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS
});

/**
 * Generate a unique filename to prevent overwrites and enhance security
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = originalName ? originalName.split('.').pop() : '';
  return `${timestamp}-${randomString}${extension ? '.' + extension : ''}`;
};

/**
 * Upload a file to Cloudinary with security enhancements
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - The Cloudinary folder path
 * @param {string} resourceType - The resource type ('image', 'video', 'raw', 'auto')
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Upload result with secure_url and public_id
 */
export const uploadToCloudinary = (fileBuffer, folder, resourceType = 'image', options = {}) => {
  return new Promise((resolve, reject) => {
    // Security configurations
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      // Generate unique public_id to prevent overwrites
      public_id: generateUniqueFilename(options.originalName),
      // Security settings
      invalidate: true, // Invalidate CDN cache
      overwrite: false, // Prevent overwriting existing files
      unique_filename: true, // Ensure unique filenames
      use_filename: false, // Don't use original filename
      // Quality and optimization
      ...(resourceType === 'image' && {
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      ...(resourceType === 'video' && {
        quality: 'auto',
        resource_type: 'video',
      }),
      // Additional options
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration, // For videos
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} resourceType - The resource type ('image', 'video', 'raw')
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};

export default cloudinary;

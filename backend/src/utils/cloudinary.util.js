import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import crypto from 'crypto';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, 
});


const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = originalName ? originalName.split('.').pop() : '';
  return `${timestamp}-${randomString}${extension ? '.' + extension : ''}`;
};


export const uploadToCloudinary = (fileBuffer, folder, resourceType = 'image', options = {}) => {
  return new Promise((resolve, reject) => {
    
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      
      public_id: generateUniqueFilename(options.originalName),
      
      invalidate: true, 
      overwrite: false, 
      unique_filename: true, 
      use_filename: false, 
      
      ...(resourceType === 'image' && {
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      ...(resourceType === 'video' && {
        quality: 'auto',
        resource_type: 'video',
      }),
      
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
            duration: result.duration, 
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



export const getSignedUrl = (publicId, resourceType = 'image', type = 'upload') => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: type,
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600, 
  });
};

export default cloudinary;

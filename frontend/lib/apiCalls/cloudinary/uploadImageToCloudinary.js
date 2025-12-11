import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;


export const uploadImageToCloudinary = async (file, onProgress) => {
  try {
    const token = Cookies.get('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    
    const maxSize = 2 * 1024 * 1024; 
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 2MB');
    }

    
    if (onProgress) {
      onProgress({ progress: 0, message: 'Preparing upload...' });
    }

    const signatureResponse = await axios.post(
      `${API_URL}/cloudinary/image-signature`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { signature, timestamp, cloudName, apiKey, folder } = 
      signatureResponse.data.data;

    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', apiKey);

    
    if (onProgress) {
      onProgress({ progress: 10, message: 'Uploading image...' });
    }

    const uploadResponse = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress({
              progress: percentCompleted,
              message: `Uploading... ${percentCompleted}%`,
            });
          }
        },
      }
    );

    
    if (onProgress) {
      onProgress({ progress: 100, message: 'Upload complete!' });
    }

    
    return {
      secure_url: uploadResponse.data.secure_url,
      public_id: uploadResponse.data.public_id,
      width: uploadResponse.data.width,
      height: uploadResponse.data.height,
      format: uploadResponse.data.format,
      bytes: uploadResponse.data.bytes,
      resource_type: uploadResponse.data.resource_type,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'Image upload failed';
    
    if (onProgress) {
      onProgress({ progress: 0, message: `Error: ${errorMessage}` });
    }
    
    throw new Error(errorMessage);
  }
};

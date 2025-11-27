import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`;

const getVideoDuration = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
    
    video.onerror = () => {
      resolve(0);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

export const uploadVideoToCloudinary = async (file, onProgress) => {
  try {
    const token = Cookies.get('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    // Step 1: Get video duration
    const duration = await getVideoDuration(file);

    // Step 2: Get upload signature from backend
    onProgress({ stage: 'signature', progress: 0, message: 'Preparing upload...' });
    
    const signatureResponse = await axios.post(
      `${API_URL}/cloudinary/video-signature`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { signature, timestamp, cloudName, apiKey, folder } = 
      signatureResponse.data.data;

    // Step 3: Build FormData for Cloudinary
    // IMPORTANT: Only include parameters that were signed
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', apiKey);

    // Step 4: Upload directly to Cloudinary
    // resource_type is in the URL, not in the form data
    onProgress({ stage: 'uploading', progress: 0, message: 'Uploading video...' });
    
    const uploadResponse = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress({
              stage: 'uploading',
              progress: percentCompleted,
              message: `Uploading video... ${percentCompleted}%`,
            });
          }
        },
      }
    );

    // Step 5: Processing complete
    onProgress({ 
      stage: 'processing', 
      progress: 100, 
      message: 'Processing video...' 
    });

    // Extract HLS URL from eager transformations (if available)
    const hlsUrl = uploadResponse.data.eager?.[0]?.secure_url || null;

    // Step 6: Return complete metadata
    const result = {
      secure_url: uploadResponse.data.secure_url,
      public_id: uploadResponse.data.public_id,
      hls_url: hlsUrl,
      duration: duration,
      format: uploadResponse.data.format,
      width: uploadResponse.data.width,
      height: uploadResponse.data.height,
      bytes: uploadResponse.data.bytes,
      resource_type: uploadResponse.data.resource_type,
    };

    onProgress({ 
      stage: 'complete', 
      progress: 100, 
      message: 'Upload complete!',
      result: result,
    });

    return result;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'Video upload failed';
    
    onProgress({ 
      stage: 'error', 
      progress: 0, 
      message: errorMessage,
    });
    
    throw new Error(errorMessage);
  }
};

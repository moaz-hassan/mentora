import { useState, useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Custom hook for managing video upload to Cloudinary with progress tracking
 * @returns {Object} Upload state and upload function
 */
export function useVideoUpload() {
  const [uploadProgress, setUploadProgress] = useState({
    isVisible: false,
    progress: 0,
    fileName: "",
    fileSize: 0,
    currentFile: 0,
    totalFiles: 0,
  });

  const uploadVideo = useCallback(async (videoFile, fileName) => {
    try {
      // Show upload progress overlay
      setUploadProgress({
        isVisible: true,
        progress: 0,
        fileName: fileName || videoFile.name,
        fileSize: videoFile.size,
        currentFile: 0,
        totalFiles: 0,
      });

      const { uploadVideoToCloudinary } = await import(
        "@/lib/apiCalls/cloudinary/uploadVideoToCloudinary"
      );

      const uploadResult = await uploadVideoToCloudinary(
        videoFile,
        (progressData) => {
          setUploadProgress((prev) => ({
            ...prev,
            progress: progressData.progress || 0,
          }));
        }
      );

      // Hide progress overlay
      setUploadProgress({
        isVisible: false,
        progress: 0,
        fileName: "",
        fileSize: 0,
        currentFile: 0,
        totalFiles: 0,
      });

      return {
        videoUrl: uploadResult.secure_url,
        videoPublicId: uploadResult.public_id,
        hlsUrl: uploadResult.hls_url,
        duration: uploadResult.duration || 0,
      };
    } catch (error) {
      setUploadProgress({
        isVisible: false,
        progress: 0,
        fileName: "",
        fileSize: 0,
        currentFile: 0,
        totalFiles: 0,
      });
      
      toast.error(error.message || "Video upload failed");
      throw error;
    }
  }, []);

  const hideProgress = useCallback(() => {
    setUploadProgress({
      isVisible: false,
      progress: 0,
      fileName: "",
      fileSize: 0,
      currentFile: 0,
      totalFiles: 0,
    });
  }, []);

  return {
    uploadProgress,
    uploadVideo,
    hideProgress,
    setUploadProgress,
  };
}

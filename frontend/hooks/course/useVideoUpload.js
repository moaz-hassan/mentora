import { useState, useCallback } from "react";
import { toast } from "sonner";


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

import { Upload, X } from "lucide-react";

import { formatFileSize } from "@/lib/apiCalls/cloudinary/formatFileSize";

export function VideoUploadProgress({ 
  isVisible, 
  progress, 
  fileName, 
  fileSize,
  currentFile,
  totalFiles,
  onCancel 
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-4">
            <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Uploading Video
        </h3>

        {/* File Info */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">{fileName}</p>
          <p className="text-xs text-gray-500">
            {fileSize && formatFileSize(fileSize)}
            {currentFile && totalFiles && (
              <span className="ml-2">
                ({currentFile} of {totalFiles})
              </span>
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-blue-500 to-blue-600 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-sm text-gray-500 text-center mb-6">
          {progress < 100 
            ? "Please wait while your video is being uploaded..." 
            : "Processing video..."}
        </p>

        {/* Cancel Button (optional) */}
        {onCancel && progress < 100 && (
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel Upload
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
}

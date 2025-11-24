"use client";

import { useState } from 'react';
import { Upload, Video, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { uploadVideoToCloudinary } from '@/lib/services/cloudinary.service';

export function IntroVideoUploader({ courseData, onVideoUploaded }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(courseData?.intro_video_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file size must be less than 100MB');
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStage('Preparing upload...');

      const result = await uploadVideoToCloudinary(videoFile, (progress) => {
        setUploadProgress(progress.progress || 0);
        setUploadStage(progress.message || 'Uploading...');
      });

      // Call parent callback with video data
      if (onVideoUploaded) {
        onVideoUploaded({
          intro_video_url: result.secure_url,
          intro_video_public_id: result.public_id,
          intro_video_hls_url: result.hls_url,
          intro_video_duration: result.duration,
        });
      }

      setUploadComplete(true);
      setUploadStage('Upload complete!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
    setUploadStage('');
    setUploadComplete(false);

    if (onVideoUploaded) {
      onVideoUploaded({
        intro_video_url: null,
        intro_video_public_id: null,
        intro_video_hls_url: null,
        intro_video_duration: 0,
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Course Introduction Video
        </h3>
        <p className="text-sm text-neutral-600">
          Upload a short video introducing your course (recommended: 1-2 minutes)
        </p>
      </div>

      {!videoPreview ? (
        <label
          htmlFor="intro-video-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 text-neutral-400 mb-4" />
            <p className="mb-2 text-sm text-neutral-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-neutral-500">
              MP4, WebM, or MOV (MAX. 100MB)
            </p>
          </div>
          <input
            id="intro-video-upload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              src={videoPreview}
              controls
              className="w-full aspect-video"
            />
            {!isUploading && !uploadComplete && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">{uploadStage}</span>
                <span className="text-neutral-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Complete */}
          {uploadComplete && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Video uploaded successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!uploadComplete && !isUploading && (
              <>
                <Button
                  onClick={handleUpload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRemove}
                  variant="outline"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </>
            )}

            {uploadComplete && (
              <Button
                onClick={handleRemove}
                variant="outline"
                className="flex-1"
              >
                Replace Video
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

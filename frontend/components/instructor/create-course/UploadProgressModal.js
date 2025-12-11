"use client";

import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function UploadProgressModal({ isOpen, progress }) {
  const getStatusIcon = () => {
    if (progress.status === 'complete' || progress.status === 'success') {
      return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    }
    if (progress.status === 'error') {
      return <XCircle className="w-6 h-6 text-red-600" />;
    }
    return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
  };

  const getProgressValue = () => {
    if (progress.videoProgress !== undefined) {
      return progress.videoProgress;
    }
    if (progress.progress !== undefined) {
      return progress.progress;
    }
    return 0;
  };

  const getStageLabel = () => {
    if (progress.uploadStage === 'signature') return 'Preparing upload...';
    if (progress.uploadStage === 'uploading') return 'Uploading video...';
    if (progress.uploadStage === 'processing') return 'Converting to HLS...';
    if (progress.uploadStage === 'complete') return 'Upload complete!';
    return 'Processing...';
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {progress.stage === 'complete' ? 'Upload Complete!' : 'Uploading Course...'}
          </DialogTitle>
          <DialogDescription>
            {progress.message || 'Processing your course content...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Upload Stage Indicator */}
          {progress.uploadStage && progress.status === 'uploading' && (
            <div className="text-sm text-blue-600 font-medium text-center">
              {getStageLabel()}
            </div>
          )}

          {/* Progress Bar */}
          {progress.status === 'uploading' && (
            <>
              <Progress value={getProgressValue()} className="w-full" />
              <div className="text-sm text-neutral-600 text-center">
                {getProgressValue()}%
              </div>
            </>
          )}

          {/* Chapter Progress */}
          {progress.chapterIndex && (
            <div className="text-sm text-neutral-700">
              Chapter {progress.chapterIndex} of {progress.totalChapters}
            </div>
          )}

          {/* Lesson Progress */}
          {progress.lessonIndex && (
            <div className="text-sm text-neutral-700">
              Lesson {progress.lessonIndex} of {progress.totalLessons}
            </div>
          )}

          {/* Success Message */}
          {(progress.status === 'complete' || progress.status === 'success') && (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-medium text-lg">
                {progress.message || 'Your course has been created successfully!'}
              </div>
              
              {/* Detailed Course Information */}
              {progress.details && (
                <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
                  <p className="font-semibold text-gray-900 text-base">
                    {progress.details.courseTitle}
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📚</span>
                      <span>{progress.details.chaptersCount} chapter{progress.details.chaptersCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      <span>{progress.details.lessonsCount} lesson{progress.details.lessonsCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">❓</span>
                      <span>{progress.details.quizzesCount} quiz{progress.details.quizzesCount !== 1 ? 'zes' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <span className="font-medium">Status:</span>
                      <span className={`font-semibold ${
                        progress.details.status === 'Draft' ? 'text-gray-600' : 'text-blue-600'
                      }`}>
                        {progress.details.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {!progress.details && (
                <div className="text-sm text-neutral-600">
                  Redirecting to your courses...
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {progress.status === 'error' && (
            <div className="text-center text-red-600 font-medium">
              {progress.message || 'An error occurred during upload'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

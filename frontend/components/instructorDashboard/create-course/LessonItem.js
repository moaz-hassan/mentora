import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  Video,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function LessonItem({ lesson, updateLesson, deleteLesson }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Check if this is a new lesson (not yet saved to backend)
  const isNewLesson = lesson.id && lesson.id.toString().startsWith("lesson-");
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: lesson.id,
    disabled: !isNewLesson // Only allow dragging new lessons
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store both the file object for upload and URL for preview
      updateLesson(lesson.id, {
        ...lesson,
        videoFile: file,
        videoUrl: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden"
      {...attributes}
    >
      {/* Lesson Header */}
      <div className="flex items-center gap-3 p-3">
        {isNewLesson ? (
          <button
            {...listeners}
            type="button"
            className="p-1 -ml-1 text-gray-400 hover:text-gray-600 focus:outline-none cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-4 h-4 ml-1" />
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-neutral-600 hover:text-neutral-900"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2 text-neutral-600">
          {lesson.type === "video" ? (
            <Video className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1">
          {isEditingTitle && isNewLesson ? (
            <Input
              value={lesson.title}
              onChange={(e) =>
                updateLesson(lesson.id, { ...lesson, title: e.target.value })
              }
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingTitle(false);
              }}
              autoFocus
              className="h-8"
            />
          ) : (
            <p
              onClick={() => isNewLesson && setIsEditingTitle(true)}
              className={`text-sm text-neutral-900 ${isNewLesson ? 'cursor-pointer hover:text-blue-600' : 'cursor-default'}`}
            >
              {lesson.title}
              {!isNewLesson && (
                <span className="ml-2 text-xs text-neutral-500">(Existing)</span>
              )}
            </p>
          )}
        </div>

        <Badge variant="outline" className="text-xs">
          {lesson.type === "video" ? "Video" : "Text"}
        </Badge>

        {isNewLesson && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteLesson(lesson.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Lesson Content */}
      {isExpanded && isNewLesson && (
        <div className="px-3 pb-3 pt-0 space-y-3">
          <div className="bg-white rounded-lg p-4 space-y-4">
            {/* Type Selector */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-700">Lesson Type</label>
              <Select
                value={lesson.type}
                onValueChange={(value) =>
                  updateLesson(lesson.id, { ...lesson, type: value })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Lesson</SelectItem>
                  <SelectItem value="text">Text Lesson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`preview-${lesson.id}`}
                checked={lesson.isPreview || false}
                onChange={(e) =>
                  updateLesson(lesson.id, { ...lesson, isPreview: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`preview-${lesson.id}`}
                className="text-sm text-neutral-700 cursor-pointer"
              >
                Allow free preview (students can watch without enrolling)
              </label>
            </div>

            {/* Video Upload */}
            {lesson.type === "video" && (
              <div className="space-y-2">
                <label className="text-sm text-neutral-700">Video Upload</label>
                {!lesson.videoUrl ? (
                  <label
                    htmlFor={`video-upload-${lesson.id}`}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-600">
                      Click to upload video
                    </span>
                    <span className="text-xs text-neutral-500 mt-1">
                      MP4, WebM, or Ogg
                    </span>
                    <input
                      id={`video-upload-${lesson.id}`}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                ) : (
                  <div className="space-y-2">
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateLesson(lesson.id, { ...lesson, videoUrl: "", videoFile: null })
                      }
                      className="w-full"
                    >
                      Remove Video
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Text Editor */}
            {lesson.type === "text" && (
              <div className="space-y-2">
                <label className="text-sm text-neutral-700">
                  Lesson Content
                </label>
                <Textarea
                  value={lesson.textContent || ""}
                  onChange={(e) =>
                    updateLesson(lesson.id, {
                      ...lesson,
                      textContent: e.target.value,
                    })
                  }
                  placeholder="Write your lesson content here..."
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-neutral-500">
                  Rich text editor would be integrated here in production
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

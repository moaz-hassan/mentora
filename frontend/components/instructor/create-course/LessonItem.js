import { useState, useRef } from "react";
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
  Paperclip,
  Eye,
  Download,
  X,
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
import { toast } from "sonner";
import { formatFileSize } from "@/lib/apiCalls/cloudinary/formatFileSize";
import { uploadFileToCloudinary } from "@/lib/apiCalls/cloudinary/uploadFileToCloudinary";

export function LessonItem({ lesson, updateLesson, deleteLesson }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const materialInputRef = useRef(null);
  
  
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
    disabled: !isNewLesson 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      
      updateLesson(lesson.id, {
        ...lesson,
        videoFile: file,
        videoUrl: URL.createObjectURL(file),
      });
    }
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase();
    if (type === "pdf") return <FileText className="w-5 h-5 text-red-600" />;
    if (["doc", "docx"].includes(type)) return <FileText className="w-5 h-5 text-blue-600" />;
    if (["ppt", "pptx"].includes(type)) return <FileText className="w-5 h-5 text-orange-600" />;
    if (["xls", "xlsx", "csv"].includes(type)) return <FileText className="w-5 h-5 text-green-600" />;
    if (type === "zip") return <FileText className="w-5 h-5 text-purple-600" />;
    return <FileText className="w-5 h-5 text-gray-600" />;
  };



  const handleMaterialUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      
      if (file.size > 104857600) {
        toast.error(`${file.name} is too large (max 100MB)`);
        continue;
      }

      
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const allowedTypes = ["pdf", "doc", "docx", "ppt", "pptx", "zip", "txt", "csv", "xlsx", "xls"];
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error(`${file.name} has an unsupported file type`);
        continue;
      }

      
      const material = {
        id: `material-${Date.now()}-${Math.random()}`,
        filename: file.name,
        file: file, 
        file_type: fileExtension,
        file_size: file.size,
        uploadedAt: new Date().toISOString(),
        pending: true, 
      };

      
      updateLesson(lesson.id, {
        ...lesson,
        materials: [...(lesson.materials || []), material],
      });

      toast.success(`${file.name} added - will upload when you save the course`);
    }

    
    if (materialInputRef.current) {
      materialInputRef.current.value = "";
    }
  };

  const removeMaterial = (materialId) => {
    const updatedMaterials = (lesson.materials || []).filter(
      (m) => m.id !== materialId
    );
    updateLesson(lesson.id, {
      ...lesson,
      materials: updatedMaterials,
    });
    toast.success("Material removed");
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden"
      {...attributes}
    >
      {}
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

      {}
      {isExpanded && isNewLesson && (
        <div className="px-3 pb-3 pt-0 space-y-3">
          <div className="bg-white rounded-lg p-4 space-y-4">
            {}
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

            {}
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

            {}
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

            {}
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

            {}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Supplementary Materials
                  </label>
                  <p className="text-xs text-neutral-500 mt-1">
                    Add downloadable resources (PDFs, documents, code files, etc.) - Max 100MB per file
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => materialInputRef.current?.click()}
                  disabled={uploadingMaterial}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingMaterial ? `Uploading ${uploadProgress}%` : "Add Material"}
                </Button>
              </div>

              {}
              <input
                ref={materialInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.csv,.xlsx,.xls"
                onChange={handleMaterialUpload}
                className="hidden"
                multiple
              />

              {}
              {lesson.materials && lesson.materials.length > 0 ? (
                <div className="space-y-2">
                  {lesson.materials.map((material, index) => (
                    <div
                      key={material.id || index}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {}
                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center flex-shrink-0 border">
                          {getFileIcon(material.file_type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {material.filename}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatFileSize(material.file_size)} • {material.file_type?.toUpperCase()}
                            {material.pending && (
                              <span className="ml-2 text-orange-600 font-medium">• Pending upload</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {}
                        {material.file_type === "pdf" && material.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(material.url, "_blank")}
                            className="h-8 w-8 p-0"
                            title="Preview PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}

                        {}
                        {material.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(material.url, "_blank")}
                            className="h-8 w-8 p-0"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}

                        {}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterial(material.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50">
                  <Paperclip className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No materials added yet</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Click "Add Material" to upload files
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

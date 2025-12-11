"use client";

import { FileText, FileArchive, FileCode, Download, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import UpNextSection from "./UpNextSection";


export default function ResourcesTab({
  materials = [],
  upNextLessons = [],
  onDownload,
  onLessonSelect,
}) {
  
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  
  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || "";
    if (type.includes("pdf")) return FileText;
    if (type.includes("zip") || type.includes("archive")) return FileArchive;
    if (type.includes("code") || type.includes("js") || type.includes("ts"))
      return FileCode;
    return File;
  };

  
  const getFileTypeDisplay = (fileType) => {
    const type = fileType?.toLowerCase() || "";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("zip")) return "ZIP";
    if (type.includes("doc")) return "DOC";
    if (type.includes("xls")) return "XLS";
    return type.toUpperCase().slice(0, 4) || "FILE";
  };

  return (
    <div className="py-6">
      {}
      <section>
        <h2 className="text-xl font-semibold mb-4">Lesson Materials</h2>

        {materials.length > 0 ? (
          <div className="space-y-3">
            {materials.map((material) => {
              const FileIcon = getFileIcon(material.file_type);
              return (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{material.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {getFileTypeDisplay(material.file_type)}
                        {material.file_size && ` • ${formatFileSize(material.file_size)}`}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload?.(material)}
                    asChild
                  >
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={material.filename}
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            No materials available for this lesson.
          </p>
        )}
      </section>

      {}
      <UpNextSection lessons={upNextLessons} onLessonSelect={onLessonSelect} />
    </div>
  );
}

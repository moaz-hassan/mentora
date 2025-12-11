"use client";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlayCircle, Lock, Clock, FileText } from "lucide-react";
import { formatDuration } from "@/lib/utils/courseUtils";

export default function CourseCurriculum({
  course,
  openPreviewModal,
  totalLessons,
  totalDuration,
}) {
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    if (course.Chapters?.length > 0) {
      setExpandedChapters({ [course.Chapters[0].id]: true });
    }
  }, [course.Chapters]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Course Curriculum
        </h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{course.Chapters?.length || 0} chapters</span>
          <span className="w-1 h-1 bg-muted rounded-full" />
          <span>{totalLessons} lessons</span>
          <span className="w-1 h-1 bg-muted rounded-full" />
          <span>{totalDuration} total length</span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {course.Chapters?.map((chapter) => (
          <Accordion
            key={chapter.id}
            type="single"
            collapsible
            value={expandedChapters[chapter.id] ? chapter.id : ""}
            onValueChange={() => toggleChapter(chapter.id)}
            className="bg-card"
          >
            <AccordionItem value={chapter.id} className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 hover:no-underline transition-colors">
                <div className="flex flex-col items-start text-left gap-1">
                  <span className="font-semibold text-foreground">
                    {chapter.title}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {chapter.Lessons?.length || 0} lessons •{" "}
                    {formatDuration(
                      chapter.Lessons?.reduce(
                        (acc, l) => acc + (l.duration || 0),
                        0
                      ) || 0
                    )}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="bg-muted/30 divide-y divide-border">
                  {chapter.Lessons?.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="px-6 py-3 flex items-center justify-between group hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.is_preview ? (
                          <PlayCircle className="w-4 h-4 text-primary" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm ${
                            lesson.is_preview
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {lesson.is_preview && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreviewModal(lesson);
                            }}
                            className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                          >
                            Preview
                          </button>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {lesson.lesson_type === "video" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {formatDuration(lesson.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
}

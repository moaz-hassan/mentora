import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChapterItem } from "./ChapterItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function CourseStructureEditor({ 
  courseData, 
  setCourseData,
  mode = "create",
  onAddChapter = null,
  onAddLesson = null,
  onAddQuiz = null
}) {
  const isEditMode = mode === "edit";
  
  
  const chapters = courseData?.chapters || [];

  const addChapter = async () => {
    if (isEditMode && onAddChapter) {
      
      try {
        await onAddChapter({
          title: `Chapter ${chapters.length + 1}`,
          description: "",
        });
      } catch (error) {
        
      }
    } else {
      
      const newChapter = {
        id: `chapter-${Date.now()}`,
        title: `Chapter ${chapters.length + 1}`,
        items: [],
      };
      setCourseData({
        ...courseData,
        chapters: [...chapters, newChapter],
      });
    }
  };

  const updateChapter = (chapterId, updatedChapter) => {
    setCourseData({
      ...courseData,
      chapters: chapters.map((ch) =>
        ch.id === chapterId ? updatedChapter : ch
      ),
    });
  };

  const deleteChapter = (chapterId) => {
    setCourseData({
      ...courseData,
      chapters: chapters.filter((ch) => ch.id !== chapterId),
    });
  };

  const moveChapter = (dragIndex, hoverIndex) => {
    const updatedChapters = [...chapters];
    const [removed] = updatedChapters.splice(dragIndex, 1);
    updatedChapters.splice(hoverIndex, 0, removed);
    setCourseData({
      ...courseData,
      chapters: updatedChapters,
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
          const rect = target.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
        return { x: 0, y: 0 };
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
      const newIndex = chapters.findIndex((ch) => ch.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setCourseData({
          ...courseData,
          chapters: arrayMove(chapters, oldIndex, newIndex),
        });
      }
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-neutral-900 dark:text-white">Course Structure</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Build your course curriculum with chapters, lessons, and quizzes
          </p>
        </div>
        <Button
          onClick={addChapter}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </Button>
      </div>

      <div className="space-y-4">
        {chapters.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
            <div className="text-neutral-400 mb-3">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-neutral-700 dark:text-neutral-300 mb-2">No chapters yet</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Get started by adding your first chapter
            </p>
            <Button
              onClick={addChapter}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Chapter
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chapters.map((chapter) => chapter.id)}
              strategy={verticalListSortingStrategy}
            >
              {chapters.map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  updateChapter={updateChapter}
                  deleteChapter={deleteChapter}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </Card>
  );
}

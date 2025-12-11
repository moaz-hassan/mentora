import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChapterItem } from "../create-course/ChapterItem";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function EditCourseStructure({ courseData, setCourseData }) {
  
  const chapters = courseData?.chapters || [];

  
  const existingChapters = chapters.filter(
    (ch) => !ch.id.toString().startsWith("chapter-")
  );
  const newChapters = chapters.filter((ch) =>
    ch.id.toString().startsWith("chapter-")
  );

  const addChapter = () => {
    const newChapter = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${chapters.length + 1}`,
      description: "",
      items: [],
    };

    
    setCourseData({
      ...courseData,
      chapters: [...chapters, newChapter],
    });
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

  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      
      const activeIsNew = active.id.toString().startsWith("chapter-");
      const overIsNew = over.id.toString().startsWith("chapter-");

      if (activeIsNew && overIsNew) {
        const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
        const newIndex = chapters.findIndex((ch) => ch.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          setCourseData({
            ...courseData,
            chapters: arrayMove(chapters, oldIndex, newIndex),
          });
        }
      }
    }
  };

  return (
    <Card className="p-6 bg-white border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Course Structure
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            View existing chapters and add new content
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
          <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-lg">
            <div className="text-neutral-400 mb-3">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              No chapters yet
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
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
          <>
            {}
            {existingChapters.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Existing Chapters
                </div>
                {existingChapters.map((chapter) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    updateChapter={updateChapter}
                    deleteChapter={deleteChapter}
                  />
                ))}
              </div>
            )}

            {}
            {newChapters.length > 0 && (
              <div className="space-y-4">
                {existingChapters.length > 0 && (
                  <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2 mt-6">
                    New Chapters (Drag to Reorder)
                  </div>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={newChapters.map((chapter) => chapter.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {newChapters.map((chapter) => (
                      <ChapterItem
                        key={chapter.id}
                        chapter={chapter}
                        updateChapter={updateChapter}
                        deleteChapter={deleteChapter}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </>
        )}
      </div>

      {}
      {existingChapters.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can add new lessons and quizzes to existing chapters.
            New chapters will be created at the end of the existing chapters.
          </p>
        </div>
      )}
    </Card>
  );
}

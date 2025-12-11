import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LessonItem } from "./LessonItem";
import { QuizItem } from "./QuizItem";

export function ChapterItem({
  chapter,
  index,
  updateChapter,
  deleteChapter,
  moveChapter,
}) {

  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  
  const isNewChapter = chapter.id && chapter.id.toString().startsWith("chapter-");
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: chapter.id,
    disabled: !isNewChapter 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    }),
    useSensor(KeyboardSensor)
  );

  
  const items = chapter.items || [];

  
  const handleItemDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        updateChapter(chapter.id, {
          ...chapter,
          items: reorderedItems,
        });
      }
    }
  };

  const addLesson = () => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${
        items.filter((item) => "type" in item).length + 1
      }`,
      type: "video",
      videoUrl: "",
      textContent: "",
    };
    updateChapter(chapter.id, {
      ...chapter,
      items: [...items, newLesson],
    });
  };

  const addQuiz = () => {
    const newQuiz = {
      id: `quiz-${Date.now()}`,
      title: `Quiz ${
        items.filter((item) => "questions" in item).length + 1
      }`,
      questions: [
        {
          id: `question-${Date.now()}`,
          question: "",
          options: [
            { a: "" },
            { b: "" },
            { c: "" },
            { d: "" }
          ],
          answer: "a",
        },
      ],
    };
    updateChapter(chapter.id, {
      ...chapter,
      items: [...items, newQuiz],
    });
  };

  const updateItem = (itemId, updatedItem) => {
    updateChapter(chapter.id, {
      ...chapter,
      items: items.map((item) =>
        item.id === itemId ? updatedItem : item
      ),
    });
  };

  const deleteItem = (itemId) => {
    updateChapter(chapter.id, {
      ...chapter,
      items: items.filter((item) => item.id !== itemId),
    });
  };

  const isLesson = (item) => {
    
    if ("questions" in item) {
      return false;
    }
    
    return "type" in item;
  };

  const lessonCount = items.filter((item) => isLesson(item)).length;
  const quizCount = items.filter((item) => !isLesson(item)).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative border rounded-lg overflow-hidden mb-4"
      {...attributes}
    >
      {}
      <div className="flex items-center gap-3 p-4 border-b border-neutral-100">
        {isNewChapter ? (
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
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          {isEditingTitle && isNewChapter ? (
            <div className="space-y-2">
              <Input
                value={chapter.title}
                onChange={(e) =>
                  updateChapter(chapter.id, { ...chapter, title: e.target.value })
                }
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="h-8"
                placeholder="Chapter title"
              />
            </div>
          ) : (
            <div>
              <h3
                onClick={() => isNewChapter && setIsEditingTitle(true)}
                className={`text-neutral-900 ${isNewChapter ? 'cursor-pointer hover:text-blue-600' : 'cursor-default'}`}
              >
                {chapter.title}
                {!isNewChapter && (
                  <span className="ml-2 text-xs text-neutral-500">(Existing)</span>
                )}
              </h3>
              {chapter.description && (
                <p className="text-sm text-neutral-600 mt-1">
                  {chapter.description}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {quizCount} quiz{quizCount !== 1 ? "zes" : ""}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addLesson}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Add Lesson
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addQuiz}
            className="gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Add Quiz
          </Button>
          {isNewChapter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteChapter(chapter.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {}
          {isNewChapter && (
            <div className="mb-4">
              <Input
                value={chapter.description || ''}
                onChange={(e) =>
                  updateChapter(chapter.id, { ...chapter, description: e.target.value })
                }
                placeholder="Chapter description (optional)"
                className="text-sm"
              />
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-500 mb-3">
                {isNewChapter ? "No lessons or quizzes yet" : "This chapter has no content"}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLesson}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Add Lesson
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addQuiz}
                  className="gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Add Quiz
                </Button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) =>
                  isLesson(item) ? (
                    <LessonItem
                      key={item.id}
                      lesson={item}
                      updateLesson={updateItem}
                      deleteLesson={deleteItem}
                    />
                  ) : (
                    <QuizItem
                      key={item.id}
                      quiz={item}
                      updateQuiz={updateItem}
                      deleteQuiz={deleteItem}
                    />
                  )
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

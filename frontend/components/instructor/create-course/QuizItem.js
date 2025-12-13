import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  HelpCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function QuizItem({ quiz, updateQuiz, deleteQuiz }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  
  const isNewQuiz = quiz.id && quiz.id.toString().startsWith("quiz-");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: quiz.id,
    disabled: !isNewQuiz, 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  
  const normalizeOptions = (options) => {
    if (!options) {
      return [{ a: "" }, { b: "" }, { c: "" }, { d: "" }];
    }
    
    if (Array.isArray(options)) {
      return options;
    }
    
    if (typeof options === "object") {
      return Object.entries(options).map(([key, value]) => ({
        [key.toLowerCase()]: value,
      }));
    }
    return [{ a: "" }, { b: "" }, { c: "" }, { d: "" }];
  };

  
  const getOptionValue = (options, optionKey) => {
    const normalizedOptions = normalizeOptions(options);
    const optionObj = normalizedOptions.find(
      (opt) => Object.keys(opt)[0] === optionKey
    );
    return optionObj ? optionObj[optionKey] : "";
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      question: "",
      options: [{ a: "" }, { b: "" }, { c: "" }, { d: "" }],
      correctAnswer: "a",
    };
    updateQuiz(quiz.id, {
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId, field, value) => {
    updateQuiz(quiz.id, {
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    });
  };

  const updateOption = (questionId, optionKey, value) => {
    updateQuiz(quiz.id, {
      ...quiz,
      questions: quiz.questions.map((q) => {
        if (q.id === questionId) {
          
          const normalizedOptions = normalizeOptions(q.options);
          const updatedOptions = normalizedOptions.map((opt) => {
            const key = Object.keys(opt)[0];
            return key === optionKey ? { [key]: value } : opt;
          });
          return { ...q, options: updatedOptions };
        }
        return q;
      }),
    });
  };

  const deleteQuestion = (questionId) => {
    updateQuiz(quiz.id, {
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== questionId),
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 overflow-hidden"
      {...attributes}
    >
      {}
      <div className="flex items-center gap-3 p-3">
        {isNewQuiz ? (
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
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <HelpCircle className="w-4 h-4" />
        </div>

        <div className="flex-1">
          {isEditingTitle && isNewQuiz ? (
            <Input
              value={quiz.title}
              onChange={(e) =>
                updateQuiz(quiz.id, { ...quiz, title: e.target.value })
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
              onClick={() => isNewQuiz && setIsEditingTitle(true)}
              className={`text-sm text-neutral-900 dark:text-white ${
                isNewQuiz
                  ? "cursor-pointer hover:text-blue-600"
                  : "cursor-default"
              }`}
            >
              {quiz.title}
              {!isNewQuiz && (
                <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                  (Existing)
                </span>
              )}
            </p>
          )}
        </div>

        <Badge variant="outline" className="text-xs">
          {quiz.questions_length} question
          {quiz.questions_length !== 1 ? "s" : ""}
        </Badge>

        {isNewQuiz && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteQuiz(quiz.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {}
      {isExpanded && isNewQuiz && (
        <div className="px-3 pb-3 pt-0 space-y-3">
          {quiz.questions.map((question, qIndex) => (
            <div
              key={question.id}
              className="bg-white dark:bg-neutral-900 rounded-lg p-4 space-y-4"
            >
              {}
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="text-xs mt-1">
                  Q{qIndex + 1}
                </Badge>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, "question", e.target.value)
                    }
                    placeholder="Enter your question here..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {}
              <div className="space-y-3 pl-12">
                <RadioGroup
                  value={question.correctAnswer || question.answer || "a"}
                  onValueChange={(value) =>
                    updateQuestion(question.id, "correctAnswer", value)
                  }
                >
                  {["a", "b", "c", "d"].map((optionKey) => {
                    const optionValue = getOptionValue(
                      question.options,
                      optionKey
                    );
                    const displayKey = optionKey.toUpperCase();

                    return (
                      <div key={optionKey} className="flex items-center gap-3">
                        <RadioGroupItem
                          value={optionKey}
                          id={`${question.id}-${optionKey}`}
                        />
                        <Label
                          htmlFor={`${question.id}-${optionKey}`}
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                        >
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-[20px]">
                            {displayKey}.
                          </span>
                          <Input
                            value={optionValue}
                            onChange={(e) =>
                              updateOption(
                                question.id,
                                optionKey,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${displayKey}`}
                            className="h-9"
                          />
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-7">
                  Select the radio button to mark the correct answer
                </p>
              </div>
            </div>
          ))}

          {}
          <Button
            variant="outline"
            onClick={addQuestion}
            className="w-full gap-2 border-dashed"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        </div>
      )}
    </div>
  );
}

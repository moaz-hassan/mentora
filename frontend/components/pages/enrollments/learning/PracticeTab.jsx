"use client";

import { FileQuestion, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PracticeTab - Practice content or quiz integration
 */
export default function PracticeTab({ quiz, isCompleted, onStartQuiz }) {
  if (quiz) {
    return (
      <div className="py-6">
        <h2 className="text-xl font-semibold mb-4">Practice Quiz</h2>

        <div className="border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileQuestion className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-1">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-muted-foreground mb-4">{quiz.description}</p>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                {quiz.questions?.length || 0} questions
              </p>

              {isCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Completed</span>
                </div>
              ) : (
                <Button onClick={onStartQuiz}>Start Quiz</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder when no quiz available
  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-4">Practice</h2>

      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Practice Content</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          This lesson doesn't have any practice exercises or quizzes yet.
        </p>
      </div>
    </div>
  );
}

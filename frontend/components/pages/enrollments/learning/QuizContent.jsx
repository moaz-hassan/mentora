"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, HelpCircle, Trophy, Flag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function QuizContent({
  quiz,
  isLoading = false,
  onSubmit,
  isCompleted = false,
  previousScore = null,
  onReportClick,
}) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);

  
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  
  if (!quiz) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a quiz to start</p>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];

  
  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  
  const handleSubmit = async () => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      
      const result = await onSubmit(answers);
      
      if (result) {
        setScore(result.score);
        setResults(result.results);
        setSubmitted(true);
        setIsRetaking(false); 
      }
    } catch (error) {
      console.error("Quiz submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const allAnswered = questions.length > 0 && 
    Object.keys(answers).length === questions.length;

  
  if (isCompleted && !submitted && !isRetaking) {
    return (
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="text-center py-8">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Quiz Completed!</h3>
          {previousScore !== null && (
            <p className="text-muted-foreground">
              Your score: <span className="font-bold text-primary">{previousScore}%</span>
            </p>
          )}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setScore(null);
              setResults(null);
              setIsRetaking(true);
            }}
          >
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-lg p-6">
      {}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{quiz.title}</h2>
        {quiz.description && (
          <p className="text-muted-foreground mt-2">{quiz.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
        <div className="flex justify-end -mt-8">
           <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-1 text-xs"
            onClick={onReportClick}
          >
            <Flag className="h-3 w-3" /> Report Quiz
          </Button>
        </div>
      </div>

      {}
      {submitted && score !== null && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-3xl font-bold text-primary">{score}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {Math.round((score / 100) * questions.length)} of {questions.length} correct
                </p>
                {score >= 70 ? (
                  <p className="text-green-600 font-medium">Passed!</p>
                ) : (
                  <p className="text-orange-600 font-medium">Keep practicing!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {}
      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          
          const result = results ? results[qIndex] : null;
          const isCorrect = submitted && result?.isCorrect;
          const correctAnswer = result?.correctAnswer;

          return (
            <Card key={qIndex} className={submitted ? (isCorrect ? "border-green-500/50" : "border-red-500/50") : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-start gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm">
                    Q{qIndex + 1}
                  </span>
                  <span>{question.question}</span>
                  {submitted && (
                    isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[qIndex] || ""}
                  onValueChange={(value) => handleAnswerChange(qIndex, value)}
                  disabled={submitted}
                >
                  {(question.options || []).map((option, oIndex) => {
                    
                    let optionValue = option;
                    let optionLabel = option;

                    if (typeof option === "object" && option !== null) {
                      const keys = Object.keys(option);
                      if (keys.length > 0) {
                        optionValue = keys[0];
                        optionLabel = option[keys[0]];
                      }
                    }

                    const isSelectedWrong = submitted && answers[qIndex] === optionValue && !isCorrect;
                    const isCorrectAnswer = submitted && optionValue === correctAnswer;

                    return (
                      <div
                        key={oIndex}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors
                          ${isCorrectAnswer ? "bg-green-50 border-green-500" : ""}
                          ${isSelectedWrong ? "bg-red-50 border-red-500" : ""}
                          ${!submitted ? "hover:bg-muted/50" : ""}
                        `}
                      >
                        <RadioGroupItem value={optionValue} id={`q${qIndex}-o${oIndex}`} />
                        <Label
                          htmlFor={`q${qIndex}-o${oIndex}`}
                          className="flex-1 cursor-pointer"
                        >
                          {optionLabel}
                        </Label>
                        {isCorrectAnswer && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {}
      {!submitted && questions.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        </div>
      )}

      {}
      {submitted && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setScore(null);
              setResults(null);
            }}
          >
            Retake Quiz
          </Button>
        </div>
      )}
    </div>
  );
}

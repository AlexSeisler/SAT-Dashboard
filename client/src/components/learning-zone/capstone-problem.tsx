import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@shared/schema";

interface CapstoneProblemProps {
  question: Question;
  onComplete: (isCorrect: boolean, answer: string) => void;
  topicName: string;
}

export function CapstoneProblem({ question, onComplete, topicName }: CapstoneProblemProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const options = question.options as string[] || [];
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setHasSubmitted(true);
    setAttempts(attempts + 1);
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setHasSubmitted(false);
  };

  const handleComplete = () => {
    onComplete(isCorrect, selectedAnswer || "");
  };

  return (
    <Card 
      className={cn(
        "border-2",
        hasSubmitted && isCorrect && "border-emerald-300 dark:border-emerald-700",
        hasSubmitted && !isCorrect && "border-rose-300 dark:border-rose-700"
      )}
      data-testid="capstone-problem"
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-medium">Capstone Problem</span>
          </div>
          <Badge variant="secondary">{topicName}</Badge>
        </div>
        <CardTitle className="text-xl leading-relaxed">
          {question.questionText}
        </CardTitle>
        <CardDescription>
          Solve this problem on your own to demonstrate your understanding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer || ""}
          onValueChange={setSelectedAnswer}
          disabled={hasSubmitted}
          className="space-y-3"
        >
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === question.correctAnswer;
            const showCorrect = hasSubmitted && isCorrectAnswer;
            const showIncorrect = hasSubmitted && isSelected && !isCorrectAnswer;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                  !hasSubmitted && isSelected && "border-primary bg-primary/5",
                  !hasSubmitted && !isSelected && "hover:bg-muted/50",
                  showCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                  showIncorrect && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                  hasSubmitted && "cursor-default"
                )}
                onClick={() => !hasSubmitted && setSelectedAnswer(option)}
              >
                <RadioGroupItem 
                  value={option} 
                  id={`capstone-${index}`}
                  data-testid={`capstone-option-${index}`}
                />
                <Label 
                  htmlFor={`capstone-${index}`} 
                  className={cn(
                    "flex-1 font-normal",
                    hasSubmitted && "cursor-default"
                  )}
                >
                  {option}
                </Label>
                {showCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {showIncorrect && (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
              </div>
            );
          })}
        </RadioGroup>

        {hasSubmitted && (
          <div className={cn(
            "mt-6 p-4 rounded-lg text-center",
            isCorrect 
              ? "bg-emerald-50 dark:bg-emerald-950/30" 
              : "bg-rose-50 dark:bg-rose-950/30"
          )}>
            {isCorrect ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Excellent work!
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You've demonstrated solid understanding of this topic
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="h-6 w-6 text-rose-500" />
                  <span className="font-semibold text-rose-700 dark:text-rose-300">
                    Not quite
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {question.explanation || "Review the lesson and try again"}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-3">
        {!hasSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            className="flex-1"
            data-testid="button-submit-capstone"
          >
            Submit Answer
          </Button>
        ) : isCorrect ? (
          <Button 
            onClick={handleComplete} 
            className="flex-1"
            data-testid="button-complete-topic"
          >
            Complete Topic
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button 
              variant="outline"
              onClick={handleRetry} 
              className="flex-1"
              data-testid="button-retry"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              onClick={handleComplete} 
              className="flex-1"
              data-testid="button-continue-anyway"
            >
              Continue Anyway
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

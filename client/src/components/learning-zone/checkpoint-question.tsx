import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@shared/schema";

interface CheckpointQuestionProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  onContinue: () => void;
}

export function CheckpointQuestion({
  question,
  onAnswer,
  onContinue,
}: CheckpointQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const options = question.options as string[] || [];
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setHasSubmitted(true);
    onAnswer(isCorrect, selectedAnswer);
  };

  const handleContinue = () => {
    onContinue();
  };

  return (
    <Card 
      className={cn(
        "border-2",
        hasSubmitted && isCorrect && "border-emerald-300 dark:border-emerald-700",
        hasSubmitted && !isCorrect && "border-amber-300 dark:border-amber-700"
      )}
      data-testid="checkpoint-question"
    >
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-primary">Checkpoint</span>
        </div>
        <CardTitle className="text-lg">{question.questionText}</CardTitle>
        <CardDescription>
          Answer this question to continue the video
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
                  id={`checkpoint-${index}`}
                  data-testid={`checkpoint-option-${index}`}
                />
                <Label 
                  htmlFor={`checkpoint-${index}`} 
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

        {hasSubmitted && question.explanation && (
          <div className={cn(
            "mt-4 p-4 rounded-lg",
            isCorrect 
              ? "bg-emerald-50 dark:bg-emerald-950/30" 
              : "bg-amber-50 dark:bg-amber-950/30"
          )}>
            <p className="text-sm font-medium mb-1">
              {isCorrect ? "Great job!" : "Here's the explanation:"}
            </p>
            <p className="text-sm text-muted-foreground">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!hasSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            className="w-full"
            data-testid="button-submit-checkpoint"
          >
            Check Answer
          </Button>
        ) : (
          <Button 
            onClick={handleContinue} 
            className="w-full"
            data-testid="button-continue-video"
          >
            Continue Video
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

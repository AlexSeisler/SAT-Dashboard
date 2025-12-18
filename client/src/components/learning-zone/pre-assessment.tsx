import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@shared/schema";

interface PreAssessmentProps {
  questions: Question[];
  onComplete: (answers: { questionId: string; answer: string; isCorrect: boolean }[]) => void;
  topicName: string;
}

export function PreAssessment({ questions, onComplete, topicName }: PreAssessmentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; isCorrect: boolean }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const newAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelectedAnswer(null);

    if (isLastQuestion) {
      onComplete(updatedAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
    }
  };

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No assessment questions available</p>
        </CardContent>
      </Card>
    );
  }

  const options = currentQuestion.options as string[] || [];

  return (
    <div className="space-y-6" data-testid="pre-assessment">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground font-medium">
            {Math.round(progress)}% complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {currentIndex + 1}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium leading-relaxed">
                {currentQuestion.questionText}
              </CardTitle>
              <CardDescription>
                Pre-assessment for {topicName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={setSelectedAnswer}
            className="space-y-3"
          >
            {options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                  selectedAnswer === option
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() => setSelectedAnswer(option)}
              >
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`}
                  data-testid={`option-${index}`}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentIndex === 0}
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedAnswer}
          data-testid="button-next"
        >
          {isLastQuestion ? (
            <>
              Complete
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PreAssessment } from "@/components/learning-zone/pre-assessment";
import { VideoPlayer } from "@/components/learning-zone/video-player";
import { CheckpointQuestion } from "@/components/learning-zone/checkpoint-question";
import { CapstoneProblem } from "@/components/learning-zone/capstone-problem";
import { ArrowLeft, BookOpen, Play, Trophy, RotateCcw, CheckCircle2, Calculator, AlertCircle } from "lucide-react";
import { useCurrentStudent, useTopic, useTopicQuestions, useCapstoneQuestion, useUpdateProgress, useRecordAttempt } from "@/hooks/use-student";
import type { Question } from "@shared/schema";

type LearningPhase = "intro" | "pre-assessment" | "video" | "checkpoint" | "capstone" | "complete" | "review";

const mockCheckpointQuestion: Question = {
  id: "checkpoint-1",
  topicId: "",
  questionText: "Based on what you just learned, which step comes first when solving 5x + 10 = 30?",
  questionType: "multiple_choice",
  options: ["Divide both sides by 5", "Subtract 10 from both sides", "Add 10 to both sides", "Multiply both sides by 5"],
  correctAnswer: "Subtract 10 from both sides",
  explanation: "When solving linear equations, we isolate the variable by undoing operations in reverse order. First subtract 10, then divide by 5.",
  difficulty: 1,
  isCapstone: false,
  videoTimestamp: 45,
};

function LearningZoneSkeleton() {
  return (
    <div className="container max-w-screen-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <Card>
        <CardContent className="py-12">
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LearningZone() {
  const params = useParams();
  const topicId = params.topicId;

  const { data: student } = useCurrentStudent();
  const { data: topic, isLoading: topicLoading, error: topicError } = useTopic(topicId);
  const { data: questions, isLoading: questionsLoading } = useTopicQuestions(topicId);
  const { data: capstoneQuestion } = useCapstoneQuestion(topicId);

  const updateProgress = useUpdateProgress();
  const recordAttempt = useRecordAttempt();

  const [phase, setPhase] = useState<LearningPhase>("intro");
  const [preAssessmentScore, setPreAssessmentScore] = useState<number | null>(null);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointAnswered, setCheckpointAnswered] = useState(false);

  const handlePreAssessmentComplete = async (answers: { questionId: string; answer: string; isCorrect: boolean }[]) => {
    const score = Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100);
    setPreAssessmentScore(score);
    
    if (student && topicId) {
      await updateProgress.mutateAsync({
        studentId: student.id,
        topicId,
        masteryState: "in_progress",
        preAssessmentScore: score,
        practiceCount: 1,
      });

      for (const answer of answers) {
        await recordAttempt.mutateAsync({
          studentId: student.id,
          questionId: answer.questionId,
          selectedAnswer: answer.answer,
          isCorrect: answer.isCorrect,
        });
      }
    }
    
    setPhase("video");
  };

  const handleCheckpointReached = () => {
    setShowCheckpoint(true);
  };

  const handleCheckpointAnswer = (isCorrect: boolean) => {
    setCheckpointAnswered(true);
  };

  const handleCheckpointContinue = () => {
    setShowCheckpoint(false);
    setCheckpointAnswered(false);
  };

  const handleVideoComplete = () => {
    setPhase("capstone");
  };

  const handleCapstoneComplete = async (isCorrect: boolean, answer: string) => {
    if (student && topicId) {
      await updateProgress.mutateAsync({
        studentId: student.id,
        topicId,
        masteryState: isCorrect ? "solid" : "shaky",
        capstoneCompleted: isCorrect,
        postAssessmentScore: isCorrect ? 100 : 50,
      });
    }
    setPhase("complete");
  };

  const startReview = () => {
    setPhase("review");
  };

  const getPhaseProgress = () => {
    switch (phase) {
      case "intro": return 0;
      case "pre-assessment": return 20;
      case "video": return 50;
      case "checkpoint": return 60;
      case "capstone": return 80;
      case "complete": return 100;
      case "review": return 100;
      default: return 0;
    }
  };

  if (!topicId) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h2 className="text-xl font-semibold">Select a Topic</h2>
              <p className="text-muted-foreground">
                Choose a topic from your roadmap to start learning
              </p>
              <Link href="/roadmap">
                <Button data-testid="button-go-to-roadmap">
                  View Roadmap
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (topicLoading || questionsLoading) {
    return <LearningZoneSkeleton />;
  }

  if (topicError || !topic) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Topic not found</h2>
            <p className="text-muted-foreground mb-4">
              The topic you're looking for doesn't exist
            </p>
            <Link href="/roadmap">
              <Button>Back to Roadmap</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assessmentQuestions = questions || [];
  const finalCapstone = capstoneQuestion || {
    id: "default-capstone",
    topicId: topic.id,
    questionText: `Apply your knowledge of ${topic.name} to solve this problem.`,
    questionType: "multiple_choice",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    explanation: "This is a practice capstone question.",
    difficulty: 3,
    isCapstone: true,
    videoTimestamp: null,
  };

  return (
    <div className="container max-w-screen-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/roadmap">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{topic.name}</h1>
            <Badge variant="secondary" className="capitalize">
              {topic.section}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {topic.description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Learning Progress</span>
          <span className="font-medium">{getPhaseProgress()}%</span>
        </div>
        <Progress value={getPhaseProgress()} className="h-2" />
      </div>

      {phase === "intro" && (
        <Card data-testid="card-intro">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Ready to Learn?
            </CardTitle>
            <CardDescription>
              Let's start with a quick assessment to see what you already know
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Calculator className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Pre-Assessment</p>
                  <p className="text-xs text-muted-foreground">{assessmentQuestions.length || 3} questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Play className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Video Lesson</p>
                  <p className="text-xs text-muted-foreground">~5 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Capstone Problem</p>
                  <p className="text-xs text-muted-foreground">Prove your skills</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setPhase("pre-assessment")} className="w-full" data-testid="button-start-learning">
              Begin Learning
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "pre-assessment" && (
        <PreAssessment
          questions={assessmentQuestions.length > 0 ? assessmentQuestions : [
            {
              id: "default-1",
              topicId: topic.id,
              questionText: `What is a key concept in ${topic.name}?`,
              questionType: "multiple_choice",
              options: ["Understanding the basics", "Memorizing formulas", "Skipping steps", "Guessing answers"],
              correctAnswer: "Understanding the basics",
              explanation: "Understanding the fundamentals is key to mastery.",
              difficulty: 1,
              isCapstone: false,
              videoTimestamp: null,
            },
          ]}
          onComplete={handlePreAssessmentComplete}
          topicName={topic.name}
        />
      )}

      {phase === "video" && !showCheckpoint && (
        <div className="space-y-4">
          {preAssessmentScore !== null && (
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Pre-Assessment Complete</p>
                      <p className="text-sm text-muted-foreground">
                        You scored {preAssessmentScore}% - {preAssessmentScore >= 70 ? "Great foundation!" : "Let's build your understanding"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <VideoPlayer
            title={`${topic.name} - Complete Guide`}
            duration={300}
            checkpoints={[{ time: 120, questionId: "q4" }]}
            onCheckpointReached={handleCheckpointReached}
            onComplete={handleVideoComplete}
          />
        </div>
      )}

      {phase === "video" && showCheckpoint && (
        <CheckpointQuestion
          question={mockCheckpointQuestion}
          onAnswer={handleCheckpointAnswer}
          onContinue={handleCheckpointContinue}
        />
      )}

      {phase === "capstone" && (
        <CapstoneProblem
          question={finalCapstone}
          onComplete={handleCapstoneComplete}
          topicName={topic.name}
        />
      )}

      {phase === "complete" && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" data-testid="card-complete">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto">
                <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  Topic Complete!
                </h2>
                <p className="text-muted-foreground mt-2">
                  Great work on {topic.name}. You've demonstrated solid understanding.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button variant="outline" onClick={startReview} data-testid="button-review-mode">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice More
                </Button>
                <Link href="/roadmap">
                  <Button data-testid="button-next-topic">
                    Continue to Roadmap
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "review" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                Review Mode
              </CardTitle>
              <CardDescription>
                Practice questions to reinforce your understanding
              </CardDescription>
            </CardHeader>
          </Card>
          <PreAssessment
            questions={assessmentQuestions.length > 0 ? assessmentQuestions : [
              {
                id: "review-1",
                topicId: topic.id,
                questionText: `Review: What is essential for understanding ${topic.name}?`,
                questionType: "multiple_choice",
                options: ["Practice and understanding", "Speed only", "Memorization only", "Guessing"],
                correctAnswer: "Practice and understanding",
                explanation: "Both practice and understanding are essential for mastery.",
                difficulty: 2,
                isCapstone: false,
                videoTimestamp: null,
              },
            ]}
            onComplete={() => setPhase("complete")}
            topicName={topic.name}
          />
        </div>
      )}
    </div>
  );
}

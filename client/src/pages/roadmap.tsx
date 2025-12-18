import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionSwimlane } from "@/components/roadmap/section-swimlane";
import { MasteryLegend } from "@/components/roadmap/mastery-node";
import { Target, TrendingUp, BookOpen, AlertCircle } from "lucide-react";
import { useCurrentStudent, useTopicsWithProgress } from "@/hooks/use-student";
import type { TopicWithProgress, SatSection } from "@shared/schema";

function RoadmapSkeleton() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-8 w-96" />
        </CardContent>
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-12 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-16 w-16 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Roadmap() {
  const { data: student, isLoading: studentLoading } = useCurrentStudent();
  const { data: topicsWithProgress, isLoading: topicsLoading, error } = useTopicsWithProgress(student?.id);

  if (studentLoading || topicsLoading) {
    return <RoadmapSkeleton />;
  }

  if (error || !topicsWithProgress) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to load roadmap</h2>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mathTopics = topicsWithProgress.filter(t => t.section === "math");
  const readingTopics = topicsWithProgress.filter(t => t.section === "reading");
  const writingTopics = topicsWithProgress.filter(t => t.section === "writing");

  const allTopics = topicsWithProgress;
  const solidCount = allTopics.filter(t => t.progress?.masteryState === "solid").length;
  const overallProgress = allTopics.length > 0 ? (solidCount / allTopics.length) * 100 : 0;

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your SAT Roadmap</h1>
        <p className="text-muted-foreground text-lg">
          Track your progress across all SAT sections and topics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card data-testid="card-overall-progress">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold tabular-nums">{Math.round(overallProgress)}%</span>
                  <span className="text-sm text-muted-foreground">Overall Mastery</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-topics-mastered">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{solidCount}</div>
                <p className="text-sm text-muted-foreground">Topics Mastered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-topics-remaining">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{allTopics.length - solidCount}</div>
                <p className="text-sm text-muted-foreground">Topics Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mastery Legend</CardTitle>
          <CardDescription>Understanding your progress states</CardDescription>
        </CardHeader>
        <CardContent>
          <MasteryLegend />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <SectionSwimlane section="math" topics={mathTopics} />
        <SectionSwimlane section="reading" topics={readingTopics} />
        <SectionSwimlane section="writing" topics={writingTopics} />
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReadinessBadge, ScoreDisplay } from "@/components/dashboard/readiness-badge";
import { RecommendationsList } from "@/components/dashboard/recommendation-card";
import { StreakDisplay } from "@/components/dashboard/streak-display";
import { Link } from "wouter";
import { ArrowRight, Map, BookOpen, Target, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { useCurrentStudent, useDashboard, useRecommendations } from "@/hooks/use-student";

function DashboardSkeleton() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: student, isLoading: studentLoading, error: studentError } = useCurrentStudent();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard(student?.id);
  const { data: recommendations, isLoading: recsLoading } = useRecommendations(student?.id);

  if (studentLoading || dashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (studentError || !student) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const readinessState = dashboard?.readinessState || "borderline";
  const streakInfo = dashboard?.streakInfo || { current: student.studyStreak, needsRecovery: false };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-welcome">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's where you stand on your SAT journey
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card data-testid="card-score-progress">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Score Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScoreDisplay
                  current={student.currentProjectedScore}
                  target={student.targetScore}
                  trend="up"
                />
              </CardContent>
            </Card>

            <Card data-testid="card-readiness">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Readiness</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ReadinessBadge state={readinessState} />
              </CardContent>
            </Card>
          </div>

          <StreakDisplay
            currentStreak={streakInfo.current}
            needsRecovery={streakInfo.needsRecovery}
            lastStudyDate={student.lastStudyDate}
          />

          <Card data-testid="card-recommendations">
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Recommended Focus</CardTitle>
                </div>
                <Link href="/roadmap">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all topics
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                These topics will give you the most improvement toward your target score
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : (
                <RecommendationsList recommendations={recommendations || []} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/roadmap" className="block">
                <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-view-roadmap">
                  <Map className="h-4 w-4" />
                  View Your Roadmap
                </Button>
              </Link>
              <Link href="/learn" className="block">
                <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-continue-learning">
                  <BookOpen className="h-4 w-4" />
                  Continue Learning
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card data-testid="card-study-tip">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Study Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Consistency matters more than intensity. Even 20-30 minutes of focused practice each day is more effective than marathon study sessions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20" data-testid="card-encouragement">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary tabular-nums">
                  {streakInfo.current}
                </div>
                <p className="text-sm text-muted-foreground">
                  {streakInfo.current === 1 ? "day" : "days"} of consistent study
                </p>
                <p className="text-xs text-muted-foreground">
                  Keep it up — you're building great habits
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import type { RecommendedFocus } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  recommendation: RecommendedFocus;
  index: number;
}

const priorityConfig = {
  1: { label: "Top Priority", variant: "default" as const, icon: Zap },
  2: { label: "High Impact", variant: "secondary" as const, icon: Target },
  3: { label: "Recommended", variant: "outline" as const, icon: TrendingUp },
};

export function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const priority = Math.min(recommendation.priority, 3) as 1 | 2 | 3;
  const config = priorityConfig[priority];
  const Icon = config.icon;

  const sectionColors = {
    math: "border-l-blue-500",
    reading: "border-l-purple-500",
    writing: "border-l-teal-500",
  };

  return (
    <Card 
      className={cn(
        "border-l-4 transition-all",
        sectionColors[recommendation.topic.section as keyof typeof sectionColors]
      )}
      data-testid={`recommendation-card-${index}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-medium leading-tight">
                {recommendation.topic.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                {recommendation.topic.section}
              </p>
            </div>
          </div>
          <Badge variant={config.variant} className="shrink-0 text-xs">
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {recommendation.reason}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-muted-foreground">
              +{recommendation.scoreImpact} potential points
            </span>
          </div>
          <Link href={`/learn/${recommendation.topic.id}`}>
            <Button size="sm" className="gap-1" data-testid={`button-start-topic-${index}`}>
              Start
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecommendationsListProps {
  recommendations: RecommendedFocus[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-muted-foreground">No recommendations yet</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Complete some practice to get personalized guidance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <RecommendationCard 
          key={rec.topic.id} 
          recommendation={rec} 
          index={index}
        />
      ))}
    </div>
  );
}

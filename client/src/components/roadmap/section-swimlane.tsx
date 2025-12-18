import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MasteryNode } from "./mastery-node";
import type { TopicWithProgress, SatSection } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Calculator, BookOpen, PenTool } from "lucide-react";

interface SectionSwimlaneProps {
  section: SatSection;
  topics: TopicWithProgress[];
}

const sectionConfig: Record<SatSection, {
  label: string;
  icon: typeof Calculator;
  color: string;
  bgClass: string;
  borderClass: string;
}> = {
  math: {
    label: "Math",
    icon: Calculator,
    color: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-800",
  },
  reading: {
    label: "Reading",
    icon: BookOpen,
    color: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-50 dark:bg-purple-950/30",
    borderClass: "border-purple-200 dark:border-purple-800",
  },
  writing: {
    label: "Writing",
    icon: PenTool,
    color: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-50 dark:bg-teal-950/30",
    borderClass: "border-teal-200 dark:border-teal-800",
  },
};

export function SectionSwimlane({ section, topics }: SectionSwimlaneProps) {
  const config = sectionConfig[section];
  const Icon = config.icon;

  const solidCount = topics.filter(t => t.progress?.masteryState === "solid").length;
  const progressPercent = topics.length > 0 ? (solidCount / topics.length) * 100 : 0;

  return (
    <Card 
      className={cn("border", config.borderClass)}
      data-testid={`section-swimlane-${section}`}
    >
      <CardHeader className={cn("pb-3", config.bgClass)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              config.bgClass,
              "border",
              config.borderClass
            )}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg">{config.label}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {solidCount} of {topics.length} topics mastered
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {Math.round(progressPercent)}%
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-1.5 mt-3" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4 justify-start">
          {topics.map((topic) => (
            <MasteryNode key={topic.id} topic={topic} size="md" />
          ))}
        </div>
        {topics.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Topics coming soon</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

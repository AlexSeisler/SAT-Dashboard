import { cn } from "@/lib/utils";
import { Check, Minus, Circle, AlertCircle } from "lucide-react";
import type { MasteryState, TopicWithProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";

interface MasteryNodeProps {
  topic: TopicWithProgress;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const masteryConfig: Record<MasteryState, {
  label: string;
  icon: typeof Check;
  bgClass: string;
  borderClass: string;
  textClass: string;
  description: string;
}> = {
  unseen: {
    label: "Not Started",
    icon: Circle,
    bgClass: "bg-muted",
    borderClass: "border-border border-2 border-dashed",
    textClass: "text-muted-foreground",
    description: "Ready to explore",
  },
  in_progress: {
    label: "In Progress",
    icon: Minus,
    bgClass: "bg-blue-100 dark:bg-blue-950/50",
    borderClass: "border-blue-300 dark:border-blue-700 border-2",
    textClass: "text-blue-700 dark:text-blue-300",
    description: "Currently learning",
  },
  shaky: {
    label: "Needs Review",
    icon: AlertCircle,
    bgClass: "bg-amber-100 dark:bg-amber-950/50",
    borderClass: "border-amber-300 dark:border-amber-700 border-2 border-dashed",
    textClass: "text-amber-700 dark:text-amber-300",
    description: "Would benefit from practice",
  },
  solid: {
    label: "Solid",
    icon: Check,
    bgClass: "bg-emerald-100 dark:bg-emerald-950/50",
    borderClass: "border-emerald-300 dark:border-emerald-700 border-2",
    textClass: "text-emerald-700 dark:text-emerald-300",
    description: "Confidently understood",
  },
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function MasteryNode({ topic, size = "md", showLabel = true }: MasteryNodeProps) {
  const state = topic.progress?.masteryState || "unseen";
  const config = masteryConfig[state];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={`/learn/${topic.id}`}>
          <div 
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
            data-testid={`mastery-node-${topic.id}`}
          >
            <div className={cn(
              "flex items-center justify-center rounded-full transition-all",
              "group-hover:scale-105 group-hover:shadow-md",
              sizeClasses[size],
              config.bgClass,
              config.borderClass
            )}>
              <Icon className={cn(iconSizes[size], config.textClass)} />
            </div>
            {showLabel && (
              <span className="text-xs text-center text-muted-foreground max-w-[80px] truncate">
                {topic.name}
              </span>
            )}
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="space-y-1">
          <p className="font-medium">{topic.name}</p>
          <p className={cn("text-xs", config.textClass)}>{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface MasteryLegendProps {
  className?: string;
}

export function MasteryLegend({ className }: MasteryLegendProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-sm", className)}>
      {(Object.entries(masteryConfig) as [MasteryState, typeof masteryConfig[MasteryState]][]).map(
        ([state, config]) => (
          <div key={state} className="flex items-center gap-1.5">
            <div className={cn(
              "h-4 w-4 rounded-full flex items-center justify-center",
              config.bgClass,
              config.borderClass
            )}>
              <config.icon className={cn("h-2.5 w-2.5", config.textClass)} />
            </div>
            <span className="text-muted-foreground">{config.label}</span>
          </div>
        )
      )}
    </div>
  );
}

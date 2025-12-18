import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import type { ReadinessState } from "@shared/schema";

interface ReadinessBadgeProps {
  state: ReadinessState;
  className?: string;
}

const stateConfig = {
  on_track: {
    label: "On Track",
    description: "You're making great progress toward your goal",
    icon: CheckCircle2,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    textClass: "text-emerald-700 dark:text-emerald-300",
    iconClass: "text-emerald-500",
  },
  borderline: {
    label: "Borderline",
    description: "A little more effort will get you there",
    icon: AlertTriangle,
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    borderClass: "border-amber-200 dark:border-amber-800",
    textClass: "text-amber-700 dark:text-amber-300",
    iconClass: "text-amber-500",
  },
  at_risk: {
    label: "Needs Focus",
    description: "Let's identify what needs attention",
    icon: AlertCircle,
    bgClass: "bg-rose-50 dark:bg-rose-950/30",
    borderClass: "border-rose-200 dark:border-rose-800",
    textClass: "text-rose-700 dark:text-rose-300",
    iconClass: "text-rose-500",
  },
};

export function ReadinessBadge({ state, className }: ReadinessBadgeProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4",
        config.bgClass,
        config.borderClass,
        className
      )}
      data-testid="readiness-badge"
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.bgClass)}>
        <Icon className={cn("h-5 w-5", config.iconClass)} />
      </div>
      <div className="flex flex-col">
        <span className={cn("font-semibold text-base", config.textClass)}>
          {config.label}
        </span>
        <span className="text-sm text-muted-foreground">
          {config.description}
        </span>
      </div>
    </div>
  );
}

interface ScoreDisplayProps {
  current: number;
  target: number;
  trend?: "up" | "down" | "stable";
}

export function ScoreDisplay({ current, target, trend = "stable" }: ScoreDisplayProps) {
  const gap = target - current;
  const progress = Math.min((current / target) * 100, 100);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground";

  return (
    <div className="space-y-4" data-testid="score-display">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Current Projected</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums">{current}</span>
            <TrendIcon className={cn("h-5 w-5", trendColor)} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">Target Score</p>
          <span className="text-2xl font-semibold text-muted-foreground tabular-nums">{target}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {gap > 0 ? `${gap} points to go` : "Target reached!"}
        </p>
      </div>
    </div>
  );
}

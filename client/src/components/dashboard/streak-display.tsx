import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  needsRecovery: boolean;
  lastStudyDate?: Date | null;
}

export function StreakDisplay({ currentStreak, needsRecovery, lastStudyDate }: StreakDisplayProps) {
  const getStreakMessage = () => {
    if (needsRecovery) {
      return "It's okay, let's pick up where you left off";
    }
    if (currentStreak === 0) {
      return "Start your streak today";
    }
    if (currentStreak === 1) {
      return "Great start! Keep it going";
    }
    if (currentStreak < 7) {
      return "You're building momentum";
    }
    if (currentStreak < 14) {
      return "Impressive consistency!";
    }
    return "Outstanding dedication!";
  };

  const getLastStudyText = () => {
    if (!lastStudyDate) return "No recent activity";
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Studied today";
    if (diff === 1) return "Last studied yesterday";
    return `Last studied ${diff} days ago`;
  };

  return (
    <Card data-testid="streak-display">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            needsRecovery 
              ? "bg-amber-100 dark:bg-amber-950/50" 
              : currentStreak > 0 
                ? "bg-orange-100 dark:bg-orange-950/50"
                : "bg-muted"
          )}>
            {needsRecovery ? (
              <Heart className="h-6 w-6 text-amber-500" />
            ) : (
              <Flame className={cn(
                "h-6 w-6",
                currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
              )} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {getStreakMessage()}
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{getLastStudyText()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

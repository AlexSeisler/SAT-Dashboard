import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

interface Checkpoint {
  time: number;
  questionId: string;
}

interface VideoPlayerProps {
  title: string;
  videoUrl?: string;
  duration: number;
  checkpoints: Checkpoint[];
  onCheckpointReached: (checkpoint: Checkpoint) => void;
  onComplete: () => void;
}

export function VideoPlayer({
  title,
  videoUrl,
  duration,
  checkpoints,
  onCheckpointReached,
  onComplete,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  const progress = (currentTime / duration) * 100;

  useEffect(() => {
    checkpoints.forEach((checkpoint) => {
      if (
        currentTime >= checkpoint.time &&
        !passedCheckpoints.has(checkpoint.time)
      ) {
        setPassedCheckpoints((prev) => new Set([...prev, checkpoint.time]));
        setIsPlaying(false);
        onCheckpointReached(checkpoint);
      }
    });

    if (currentTime >= duration && duration > 0) {
      onComplete();
    }
  }, [currentTime, checkpoints, duration, passedCheckpoints, onCheckpointReached, onComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 0.1, duration));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentTime(0);
    setPassedCheckpoints(new Set());
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="overflow-hidden" data-testid="video-player">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            muted={isMuted}
          />
        ) : (
          <div className="text-center text-white/80 p-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="h-12 w-12 text-white/60" />
            </div>
            <p className="text-lg font-medium mb-2">{title}</p>
            <p className="text-sm text-white/60">
              Interactive video lesson ({formatTime(duration)})
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="relative mb-3">
            <Progress value={progress} className="h-1.5 bg-white/20" />
            {checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.time}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white transition-colors",
                  passedCheckpoints.has(checkpoint.time)
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                )}
                style={{ left: `${(checkpoint.time / duration) * 100}%` }}
                title="Checkpoint question"
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={togglePlay}
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={restart}
                data-testid="button-restart"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <span className="text-sm text-white/80 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="button-mute"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

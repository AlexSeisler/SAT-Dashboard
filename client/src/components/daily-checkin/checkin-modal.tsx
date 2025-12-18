import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calendar, Smile, Meh, Frown, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { studiedTopics: string[]; confidenceLevel: number; notes?: string }) => void;
  recentTopics: { id: string; name: string }[];
}

const confidenceLevels = [
  { value: 1, label: "Struggling", description: "Finding it difficult", icon: Frown, color: "text-rose-500" },
  { value: 2, label: "Uncertain", description: "Making progress but unsure", icon: Meh, color: "text-amber-500" },
  { value: 3, label: "Confident", description: "Feeling good about it", icon: Smile, color: "text-emerald-500" },
];

export function CheckInModal({ isOpen, onClose, onSubmit, recentTopics }: CheckInModalProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSubmit = () => {
    if (confidenceLevel === null) return;
    onSubmit({
      studiedTopics: selectedTopics,
      confidenceLevel,
      notes: notes.trim() || undefined,
    });
    setSelectedTopics([]);
    setConfidenceLevel(null);
    setNotes("");
    onClose();
  };

  const canSubmit = confidenceLevel !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="checkin-modal">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Daily Check-in</DialogTitle>
              <DialogDescription>
                Quick reflection to track your progress
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              What did you work on today?
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {recentTopics.map((topic) => (
                <Badge
                  key={topic.id}
                  variant={selectedTopics.includes(topic.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTopics.includes(topic.id) && "bg-primary"
                  )}
                  onClick={() => handleTopicToggle(topic.id)}
                  data-testid={`topic-badge-${topic.id}`}
                >
                  {selectedTopics.includes(topic.id) && (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  )}
                  {topic.name}
                </Badge>
              ))}
            </div>
            {recentTopics.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No topics studied yet. Start your first lesson!
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How are you feeling about your progress?
            </Label>
            <RadioGroup
              value={confidenceLevel?.toString() || ""}
              onValueChange={(val) => setConfidenceLevel(parseInt(val))}
              className="grid grid-cols-3 gap-3"
            >
              {confidenceLevels.map((level) => {
                const Icon = level.icon;
                const isSelected = confidenceLevel === level.value;

                return (
                  <div key={level.value}>
                    <RadioGroupItem
                      value={level.value.toString()}
                      id={`confidence-${level.value}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`confidence-${level.value}`}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      )}
                      data-testid={`confidence-${level.value}`}
                    >
                      <Icon className={cn("h-8 w-8", level.color)} />
                      <span className="text-sm font-medium">{level.label}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-medium">
              Any notes for yourself?
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Things you want to remember, areas to focus on..."
              className="resize-none"
              rows={3}
              data-testid="input-notes"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} data-testid="button-skip-checkin">
            Skip for now
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit}
            data-testid="button-submit-checkin"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save Check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

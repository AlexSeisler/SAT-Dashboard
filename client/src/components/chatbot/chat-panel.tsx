import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Bot, User, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const getMockedResponse = (userMessage: string, context?: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("help") || lowerMessage.includes("stuck")) {
    return "I'm here to help! Can you tell me more specifically what you're finding challenging? I can break down the concept step by step, or we can try a different approach if that works better for you.";
  }
  
  if (lowerMessage.includes("explain") || lowerMessage.includes("understand")) {
    return "Great question! Let me break this down for you. The key concept here is to think about it in smaller parts. Would you like me to walk through an example together?";
  }
  
  if (lowerMessage.includes("practice") || lowerMessage.includes("more")) {
    return "Practice is a great idea! I'd recommend focusing on similar problems first to build your confidence. Would you like me to suggest which topic areas would give you the most improvement?";
  }
  
  if (lowerMessage.includes("score") || lowerMessage.includes("progress")) {
    return "Your progress is looking good! You've been consistent with your studying, which is the most important factor. Keep focusing on your recommended topics, and you'll see improvement in your projected score.";
  }
  
  if (lowerMessage.includes("tired") || lowerMessage.includes("frustrated") || lowerMessage.includes("hard")) {
    return "I understand - SAT prep can be demanding. It's completely normal to feel this way sometimes. Remember, taking breaks is important for learning. Would you like some tips on how to study more efficiently?";
  }
  
  if (lowerMessage.includes("math")) {
    return "Math is one of the areas where consistent practice really pays off. For SAT math, focus on understanding the concepts rather than memorizing formulas. What specific type of math problem would you like help with?";
  }
  
  if (lowerMessage.includes("reading") || lowerMessage.includes("passage")) {
    return "For reading passages, try to identify the main idea first before diving into the questions. Annotating key points as you read can also help. Would you like some strategies for different question types?";
  }
  
  if (lowerMessage.includes("writing") || lowerMessage.includes("grammar")) {
    return "Writing and language questions often test the same grammar rules repeatedly. Focus on understanding comma usage, subject-verb agreement, and clear/concise expression. Want me to explain any of these in more detail?";
  }

  if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
    return "Hello! I'm your SAT study assistant. I'm here to help you understand concepts, answer questions, and keep you motivated. What would you like to work on today?";
  }

  return "That's a thoughtful question. Based on where you are in your preparation, I'd suggest focusing on building strong foundations first. Would you like me to help you identify which areas would benefit most from your attention?";
};

interface ChatPanelProps {
  context?: string;
}

export function ChatPanel({ context }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your SAT study assistant. I'm here to help explain concepts, answer questions, and support you throughout your preparation. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getMockedResponse(userMessage.content, context);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-left">Study Assistant</SheetTitle>
                  <p className="text-sm text-muted-foreground text-left">
                    {context ? `Helping with: ${context}` : "Here to help"}
                  </p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn(
                      message.role === "assistant" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted"
                    )}>
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2.5 max-w-[85%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1"
                data-testid="input-chat"
              />
              <Button 
                onClick={handleSend} 
                size="icon"
                disabled={!input.trim() || isTyping}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Your study assistant is here to help
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

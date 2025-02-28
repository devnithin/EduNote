import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, ArrowLeftRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIControlsProps {
  content: string;
  onUpdate: (content: string) => void;
}

export default function AIControls({ content, onUpdate }: AIControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const processText = async (endpoint: string) => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please write some text first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", `/api/ai/${endpoint}`, { text: content });
      const data = await res.json();
      onUpdate(data.result);
      toast({
        title: "Success",
        description: `Text has been ${endpoint}d`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process text",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 bg-muted p-1 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => processText("summarize")}
        disabled={isLoading}
        className="flex items-center gap-2 min-w-[100px]"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        Summarize
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => processText("grammar")}
        disabled={isLoading}
        className="flex items-center gap-2 min-w-[100px]"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        Grammar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => processText("paraphrase")}
        disabled={isLoading}
        className="flex items-center gap-2 min-w-[100px]"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowLeftRight className="h-4 w-4" />
        )}
        Rephrase
      </Button>
    </div>
  );
}
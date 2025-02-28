import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wand2, ArrowLeftRight } from "lucide-react"; //Grammar import removed
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
    <Card className="p-4 flex gap-2">
      <Button
        variant="outline"
        onClick={() => processText("summarize")}
        disabled={isLoading}
      >
        <Wand2 className="w-4 h-4 mr-2" />
        Summarize
      </Button>
      <Button
        variant="outline"
        onClick={() => processText("grammar")}
        disabled={isLoading}
      >
        <Wand2 className="w-4 h-4 mr-2" /> {/*Grammar icon replaced with Wand2*/}
        Fix Grammar
      </Button>
      <Button
        variant="outline"
        onClick={() => processText("paraphrase")}
        disabled={isLoading}
      >
        <ArrowLeftRight className="w-4 h-4 mr-2" />
        Paraphrase
      </Button>
    </Card>
  );
}
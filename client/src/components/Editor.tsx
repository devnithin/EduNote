import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AIProcess } from "@shared/schema";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const { toast } = useToast();
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ content, type }: AIProcess) => {
      const res = await apiRequest("POST", "/api/process", { content, type });
      return res.json();
    },
    onSuccess: (data) => {
      editor?.commands.setContent(data.text);
      toast({
        title: "Success",
        description: "Text processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProcess = (type: AIProcess["type"]) => {
    const content = editor?.getHTML() || "";
    processMutation.mutate({ content, type });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleProcess("summarize")}
          disabled={processMutation.isPending}
        >
          {processMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Summarize
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleProcess("grammar")}
          disabled={processMutation.isPending}
        >
          {processMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Fix Grammar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleProcess("paraphrase")}
          disabled={processMutation.isPending}
        >
          {processMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Paraphrase
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[200px] p-4 rounded-md border"
      />
    </div>
  );
}

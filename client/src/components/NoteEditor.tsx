import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import AIControls from "@/components/AIControls";
import type { Note } from "@shared/schema";

interface NoteEditorProps {
  note?: Note;
  onSave: (note: { title: string; content: string }) => void;
}

export default function NoteEditor({ note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg mx-auto focus:outline-none min-h-[200px] p-4 border rounded-lg",
        placeholder: "Start writing your note here...",
      },
    },
  });

  const handleSave = () => {
    if (editor) {
      onSave({
        title,
        content: editor.getHTML(),
      });
    }
  };

  const handleAIUpdate = (content: string) => {
    if (editor) {
      editor.commands.setContent(content);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          className="text-xl font-bold"
        />

        <div className="border rounded-lg p-1 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <div className="absolute right-0 -top-10">
            <AIControls
              content={editor?.getHTML() || ""}
              onUpdate={handleAIUpdate}
            />
          </div>
          <div className="border rounded-lg p-4 bg-background hover:border-primary transition-colors cursor-text">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Note</Button>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bold, Italic, List, ListOrdered, Type } from "lucide-react";
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
        class: "prose prose-sm sm:prose-base lg:prose-lg prose-primary focus:outline-none min-h-[200px] p-6",
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'bg-accent' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive('italic') ? 'bg-accent' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={editor?.isActive('bulletList') ? 'bg-accent' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={editor?.isActive('orderedList') ? 'bg-accent' : ''}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <AIControls
            content={editor?.getHTML() || ""}
            onUpdate={handleAIUpdate}
          />
        </div>

        {/* Editor */}
        <div className="relative rounded-lg border bg-card p-4 hover:border-primary transition-colors">
          <div className="absolute -top-3 left-4 px-2 bg-background text-xs text-muted-foreground">
            <Type className="w-4 h-4 inline mr-1" />
            Content
          </div>
          <EditorContent editor={editor} />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} size="lg" className="px-8">
            Save Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
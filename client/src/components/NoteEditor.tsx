import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
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
        class: "prose prose-sm sm:prose-base lg:prose-lg mx-auto focus:outline-none",
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

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="mb-4 text-xl font-bold"
        />
        <div className="border rounded-lg p-1 mb-4 flex gap-1">
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
        <EditorContent editor={editor} className="min-h-[200px]" />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>Save Note</Button>
        </div>
      </CardContent>
    </Card>
  );
}

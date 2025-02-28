import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Note } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const createMutation = useMutation({
    mutationFn: async (note: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/notes", note);
      return res.json();
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setActiveNote(note);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      note,
    }: {
      id: number;
      note: Partial<Note>;
    }) => {
      const res = await apiRequest("PATCH", `/api/notes/${id}`, note);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
  });

  const handleNewNote = () => {
    setActiveNote(null);
    setTitle("");
    setContent("");
  };

  const handleNoteSelect = (note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleSave = () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (activeNote) {
      updateMutation.mutate({
        id: activeNote.id,
        note: { title, content },
      });
    } else {
      createMutation.mutate({ title, content });
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        notes={notes}
        activeNoteId={activeNote?.id}
        onNoteSelect={handleNoteSelect}
        onNewNote={handleNewNote}
      />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save
          </Button>
        </div>
        <Editor content={content} onChange={setContent} />
      </main>
    </div>
  );
}

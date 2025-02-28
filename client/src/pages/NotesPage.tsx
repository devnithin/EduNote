import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Note } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import NoteEditor from "@/components/NoteEditor";
import AIControls from "@/components/AIControls";
import { useToast } from "@/hooks/use-toast";

export default function NotesPage() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const createNote = useMutation({
    mutationFn: async (note: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/notes", note);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({
      id,
      note,
    }: {
      id: number;
      note: { title: string; content: string };
    }) => {
      const res = await apiRequest("PUT", `/api/notes/${id}`, note);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setSelectedNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">My Notes</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {(isCreating || selectedNote) && (
        <div className="mb-6">
          <NoteEditor
            note={selectedNote || undefined}
            onSave={(note) => {
              if (selectedNote) {
                updateNote.mutate({ id: selectedNote.id, note });
              } else {
                createNote.mutate(note);
              }
            }}
          />
          {selectedNote && (
            <div className="mt-4">
              <AIControls
                content={selectedNote.content}
                onUpdate={(content) =>
                  updateNote.mutate({
                    id: selectedNote.id,
                    note: { title: selectedNote.title, content },
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes?.map((note) => (
          <div
            key={note.id}
            className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
            onClick={() => setSelectedNote(note)}
          >
            <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
            <div
              className="text-muted-foreground line-clamp-3"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote.mutate(note.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

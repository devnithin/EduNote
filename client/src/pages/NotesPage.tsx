import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Book, ArrowLeft, LogOut } from "lucide-react";
import type { Note } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import NoteEditor from "@/components/NoteEditor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo"; // Added Logo import


export default function NotesPage() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center">
          {selectedNote && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedNote(null)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-4"> {/* Added container for logo and title */}
            <Logo /> {/* Placeholder for logo */}
            <h1 className="text-xl font-bold">EduNote</h1> {/* Renamed to EduNote */}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Welcome back, {user?.username}!</h1>
              <p className="text-muted-foreground">Create and manage your notes with AI assistance</p>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Note
            </Button>
          </div>

          {/* Note Editor Section */}
          {(isCreating || selectedNote) && (
            <div className="mb-12">
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
            </div>
          )}

          {/* Notes Grid Section */}
          {notes?.length === 0 && !isCreating ? (
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first note
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {notes?.map((note) => (
                <div
                  key={note.id}
                  className="group bg-card hover:bg-accent rounded-xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedNote(note)}
                >
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{note.title}</h2>
                  <div
                    className="text-muted-foreground line-clamp-3 mb-4 prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                  <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNote(note)}
                    >
                      Edit
                    </Button>
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
          )}
        </div>
      </div>
    </div>
  );
}
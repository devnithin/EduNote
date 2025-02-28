import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { NoteCard } from "./NoteCard";
import { Plus } from "lucide-react";
import type { Note } from "@shared/schema";

interface SidebarProps {
  notes: Note[];
  activeNoteId?: number;
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
}

export function Sidebar({
  notes,
  activeNoteId,
  onNoteSelect,
  onNewNote,
}: SidebarProps) {
  return (
    <div className="w-64 border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={onNewNote} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => onNoteSelect(note)}
              isActive={note.id === activeNoteId}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

import { Card, CardHeader, CardTitle } from "./ui/card";
import { format } from "date-fns";
import type { Note } from "@shared/schema";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  isActive?: boolean;
}

export function NoteCard({ note, onClick, isActive }: NoteCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-accent ${
        isActive ? "border-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium">{note.title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {format(new Date(note.lastModified), "MMM d, yyyy")}
        </p>
      </CardHeader>
    </Card>
  );
}

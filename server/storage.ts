import { type Note, type InsertNote } from "@shared/schema";

export interface IStorage {
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private notes: Map<number, Note>;
  private currentId: number;

  constructor() {
    this.notes = new Map();
    this.currentId = 1;
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const note: Note = {
      ...insertNote,
      id,
      lastModified: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note> {
    const existing = await this.getNote(id);
    if (!existing) {
      throw new Error("Note not found");
    }

    const updated: Note = {
      ...existing,
      ...note,
      lastModified: new Date(),
    };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }
}

export const storage = new MemStorage();

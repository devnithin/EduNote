import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  lastModified: timestamp("last_modified").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  lastModified: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export const aiProcessSchema = z.object({
  content: z.string(),
  type: z.enum(["summarize", "grammar", "paraphrase"]),
});

export type AIProcess = z.infer<typeof aiProcessSchema>;

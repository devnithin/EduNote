import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema } from "@shared/schema";
import { summarizeText, correctGrammar, paraphraseText } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes CRUD
  app.get("/api/notes", async (_req, res) => {
    const notes = await storage.getNotes();
    res.json(notes);
  });

  app.post("/api/notes", async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid note data" });
    }
    const note = await storage.createNote(result.data);
    res.json(note);
  });

  app.put("/api/notes/:id", async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid note data" });
    }
    try {
      const note = await storage.updateNote(Number(req.params.id), result.data);
      res.json(note);
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    await storage.deleteNote(Number(req.params.id));
    res.status(204).end();
  });

  // AI Routes
  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const summary = await summarizeText(text);
      res.json({ result: summary });
    } catch (error) {
      res.status(500).json({ error: "Failed to summarize text" });
    }
  });

  app.post("/api/ai/grammar", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const corrected = await correctGrammar(text);
      res.json({ result: corrected });
    } catch (error) {
      res.status(500).json({ error: "Failed to correct grammar" });
    }
  });

  app.post("/api/ai/paraphrase", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const paraphrased = await paraphraseText(text);
      res.json({ result: paraphrased });
    } catch (error) {
      res.status(500).json({ error: "Failed to paraphrase text" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
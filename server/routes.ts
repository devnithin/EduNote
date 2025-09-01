import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema } from "@shared/schema";
import { summarizeText, correctGrammar, paraphraseText, chat } from "./ai";
import { setupAuth } from "./auth";

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Protected Notes CRUD routes
  app.get("/api/notes", isAuthenticated, async (req, res) => {
    const notes = await storage.getNotes(req.user!.id);
    res.json(notes);
  });

  app.post("/api/notes", isAuthenticated, async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid note data" });
    }
    const note = await storage.createNote(req.user!.id, result.data);
    res.json(note);
  });

  app.put("/api/notes/:id", isAuthenticated, async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid note data" });
    }
    try {
      const note = await storage.getNote(Number(req.params.id));
      if (!note || note.userId !== req.user!.id) {
        return res.status(404).json({ error: "Note not found" });
      }
      const updatedNote = await storage.updateNote(Number(req.params.id), result.data);
      res.json(updatedNote);
    } catch (error) {
      res.status(404).json({ error: "Note not found" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req, res) => {
    const note = await storage.getNote(Number(req.params.id));
    if (!note || note.userId !== req.user!.id) {
      return res.status(404).json({ error: "Note not found" });
    }
    await storage.deleteNote(Number(req.params.id));
    res.status(204).end();
  });

  // Protected AI routes
  app.post("/api/ai/summarize", isAuthenticated, async (req, res) => {
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

  app.post("/api/ai/grammar", isAuthenticated, async (req, res) => {
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

  app.post("/api/ai/paraphrase", isAuthenticated, async (req, res) => {
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

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      console.log("Chat request received:", message);
      
      if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set");
        return res.status(500).json({ 
          error: "GEMINI_API_KEY not configured. Please set up the API key in the Secrets tab." 
        });
      }
      
      // Use Gemini for chat functionality
      const aiResponse = await chat(message);
      console.log("Chat response successfully received and processed");
      
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: `Chat error: ${(error as Error).message}`,
        details: "Please make sure GEMINI_API_KEY is properly configured in your environment variables."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
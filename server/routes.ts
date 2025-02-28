import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema } from "@shared/schema";
import { summarizeText, correctGrammar, paraphraseText } from "./ai";
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

  const httpServer = createServer(app);
  return httpServer;
}
import { Router } from "express";
import { db } from "./db";
import { notes, users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { summarizeText, correctGrammar, paraphraseText } from "./ai";
import { summarizeText as summarizeTextOpenAI, correctGrammar as correctGrammarOpenAI, paraphraseText as paraphraseTextOpenAI } from "./openai";
import OpenAI from "openai";

export const router = Router();

// Text processing routes
router.post("/api/ai/process", isAuthenticated, async (req, res) => {
  try {
    const { text, type, model } = req.body;
    
    if (!text || !type) {
      return res.status(400).json({ error: "Text and type are required" });
    }
    
    let result;
    
    if (model === "openai") {
      switch (type) {
        case "summarize":
          result = await summarizeTextOpenAI(text);
          break;
        case "grammar":
          result = await correctGrammarOpenAI(text);
          break;
        case "paraphrase":
          result = await paraphraseTextOpenAI(text);
          break;
        default:
          return res.status(400).json({ error: "Invalid type" });
      }
    } else {
      switch (type) {
        case "summarize":
          result = await summarizeText(text);
          break;
        case "grammar":
          result = await correctGrammar(text);
          break;
        case "paraphrase":
          result = await paraphraseText(text);
          break;
        default:
          return res.status(400).json({ error: "Invalid type" });
      }
    }
    
    res.json({ result });
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({ error: "Failed to process text" });
  }
});

// NEW: AI Chat endpoint
router.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Use OpenAI by default for chat functionality
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides concise, accurate answers. You're part of an educational note-taking application."
        },
        { role: "user", content: message }
      ],
    });
    
    const aiResponse = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// Notes routes
router.get("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, req.user.id))
      .orderBy(notes.updatedAt);

    res.json(userNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// More routes...

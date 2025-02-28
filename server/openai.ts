
// Optional OpenAI integration - only used if OPENAI_API_KEY is provided
import OpenAI from "openai";

// Only create the client if the API key exists
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

export async function summarizeText(text: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Summarize the following text concisely while maintaining key points. Return only the summary.",
      },
      { role: "user", content: text },
    ],
  });

  return response.choices[0].message.content || "";
}

export async function correctGrammar(text: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Correct any grammar errors in the following text. Return only the corrected text.",
      },
      { role: "user", content: text },
    ],
  });

  return response.choices[0].message.content || "";
}

export async function paraphraseText(text: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Rewrite the following text in a different way while maintaining the same meaning. Return only the paraphrased text.",
      },
      { role: "user", content: text },
    ],
  });

  return response.choices[0].message.content || "";
}

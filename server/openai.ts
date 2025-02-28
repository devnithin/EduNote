import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeText(text: string): Promise<string> {
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

import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPTS = {
  summarize: "Summarize the following text concisely while maintaining key points. Return JSON in format: { text: string }",
  grammar: "Fix any grammar errors in the following text. Return JSON in format: { text: string }",
  paraphrase: "Rewrite the following text in a different way while keeping the same meaning. Return JSON in format: { text: string }"
};

export async function processText(text: string, type: "summarize" | "grammar" | "paraphrase"): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: PROMPTS[type]
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.text;
  } catch (error) {
    throw new Error(`Failed to process text: ${error.message}`);
  }
}

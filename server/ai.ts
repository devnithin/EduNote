import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const PROMPTS = {
  summarize: "Summarize the following text concisely while maintaining key points. Return response in format: { text: 'your summary here' }",
  grammar: "Fix any grammar errors in the following text. Return response in format: { text: 'your corrected text here' }",
  paraphrase: "Rewrite the following text in a different way while keeping the same meaning. Return response in format: { text: 'your rewritten text here' }"
};

export async function processText(text: string, type: "summarize" | "grammar" | "paraphrase"): Promise<string> {
  try {
    const prompt = PROMPTS[type] + "\n\nText to process:\n" + text;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const textContent = response.text();
    
    // Try to parse as JSON first
    try {
      const jsonResponse = JSON.parse(textContent);
      return jsonResponse.text;
    } catch {
      // If not valid JSON, return the text directly
      return textContent;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to process text: ${errorMessage}`);
  }
}

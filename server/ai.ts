import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function summarizeText(text: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Summarize the following text concisely while maintaining key points. Return only the summary:\n\n" + text;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    return responseText;
  } catch (error) {
    console.error("Summarize error:", error);
    throw new Error("Failed to summarize text");
  }
}

export async function correctGrammar(text: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Correct any grammar errors in the following text. Return only the corrected text:\n\n" + text;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    return responseText;
  } catch (error) {
    console.error("Grammar correction error:", error);
    throw new Error("Failed to correct grammar");
  }
}

export async function chat(message: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set");
      throw new Error("GEMINI_API_KEY not configured");
    }

    console.log("Using Gemini API with key:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Sending message to Gemini API:", message);
    const result = await model.generateContent(message);
    const response = await result.response;
    console.log("Received response from Gemini API");

    if (response && typeof response.text === 'function') {
      const responseText = response.text();
      console.log("Successfully processed response text");
      return responseText;
    } else {
      console.error("Invalid response format:", response);
      throw new Error("Empty or invalid response from Gemini API");
    }
  } catch (error) {
    console.error("Error in chat function:", error);
    throw new Error(`Failed to process chat message: ${error.message}`);
  }
}

export async function paraphraseText(text: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Rewrite the following text in a different way while maintaining the same meaning. Return only the paraphrased text:\n\n" + text;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    return responseText;
  } catch (error) {
    console.error("Paraphrase error:", error);
    throw new Error("Failed to paraphrase text");
  }
}
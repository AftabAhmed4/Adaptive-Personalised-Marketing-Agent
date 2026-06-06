import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

if (API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
}

/**
 * Generates content from Gemini model. 
 * Falls back to mock responses if no key is set.
 */
export async function generateText(prompt: string, fallbackResponse: string): Promise<string> {
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text || fallbackResponse;
    } catch (error) {
      console.error("Gemini API call failed, using fallback:", error);
      return fallbackResponse;
    }
  }

  // Simulate AI latency in fallback mode
  await new Promise(resolve => setTimeout(resolve, 1500));
  return fallbackResponse;
}

/**
 * Helper to call Gemini and parse JSON response.
 * Falls back to direct parse of fallbackObj.
 */
export async function generateJSON<T>(prompt: string, fallbackObj: T): Promise<T> {
  const promptWithJsonInstruction = `${prompt}\n\nIMPORTANT: Return ONLY a raw JSON object matching the requested fields. Do not include markdown block formatting, code blocks (like \`\`\`json), or explanations. Your response must be directly parseable by JSON.parse.`;
  
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptWithJsonInstruction,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text?.trim() || "";
      // In case the model returns markdown code block even with application/json mime type
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (error) {
      console.error("Gemini JSON generation failed, using fallback object:", error);
      return fallbackObj;
    }
  }

  // Simulate AI latency in fallback mode
  await new Promise(resolve => setTimeout(resolve, 1500));
  return fallbackObj;
}

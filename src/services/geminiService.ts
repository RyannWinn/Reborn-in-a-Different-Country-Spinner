import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAIClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please add it to your secrets.");
    }
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

export async function getCountryInsight(countryName: string) {
  try {
    const client = getAIClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a "Global Destiny" guide. A user has just "landed" in ${countryName} on a population-weighted luck wheel. 
    Provide a short, 2-3 sentence evocative welcome message. Mention one unique cultural fact or interesting demographic detail that makes ${countryName} special.
    Keep it welcoming, slightly poetic, and informative. Use plain text.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    // If it's a missing API key error, return a more specific message or the default
    return `Welcome to ${countryName}! A beautiful land with a rich history and vibrant culture. (Insight service currently unavailable)`;
  }
}

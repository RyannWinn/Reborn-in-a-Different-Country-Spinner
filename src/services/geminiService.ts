import { GoogleGenAI } from "@google/genai";

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getCountryInsight(countryName: string): Promise<{ city: string; survivalProbability: string; socialClass: string; insight: string }> {
  try {
    const ai = getAI();
    
    const prompt = `You are a "Rebirth Simulation" guide. A user has just been "reborn" in ${countryName}.
      
      Please provide:
      1. A specific city in ${countryName}. RANDOMLY select one from at least 5 major cities.
      2. A "Survival & Quality of Life" index percentage (0-100%).
      3. A "Social Class" simulation: "Low", "Medium", or "High".
      4. A "Life Narrative": Write a 3-4 sentence story in the first person ("I was born into...") about what your life is like here based on the city, country, and class. Make it evocative, realistic, and character-driven (e.g., mention your home, a daily struggle or comfort, and a hope or fear).
      
      Format the response as a JSON object:
      {
        "city": "City Name",
        "survivalProbability": "85%",
        "socialClass": "Medium",
        "insight": "The life narrative story here..."
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);
    
    if (data.city === "Mumbai" && countryName !== "India") {
      data.city = "The Capital";
    }
    
    return data;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      city: countryName === "India" ? "Mumbai" : "The Capital",
      survivalProbability: "75%",
      socialClass: "Medium",
      insight: `My journey begins in the heart of ${countryName}. The air is filled with the sounds of a vibrant community, and though my future is unwritten, my spirit is resilient as I adapt to this new life.`
    };
  }
}

export async function generateFateQuestions(countryName: string, city: string, socialClass: string): Promise<{ question: string; options: { text: string; effect: number }[] }[]> {
  try {
    const ai = getAI();
    const prompt = `Generate 5 life-defining "What would you do?" questions for a person living in ${city}, ${countryName} with a ${socialClass} social class.
    Each question must have exactly 2 options.
    Each option should have a "text" and an "effect" (a number between -5 and 5 representing the impact on life expectancy).
    The questions should be culturally specific to ${countryName} and realistic for a ${socialClass} class person.
    
    Format as JSON:
    [
      {
        "question": "Question text?",
        "options": [
          {"text": "Option 1", "effect": 2},
          {"text": "Option 2", "effect": -3}
        ]
      },
      ...5 questions total
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Fate AI Error:", error);
    return Array(5).fill(null).map((_, i) => ({
      question: `Question ${i + 1} about life in ${countryName}?`,
      options: [
        { text: "Take the safe path", effect: 1 },
        { text: "Take the risky path", effect: -1 }
      ]
    }));
  }
}

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

export async function getCountryInsight(countryName: string): Promise<{ 
  city: string; 
  survivalProbability: string; 
  socialClass: string; 
  insight: string;
  rankings?: { category: string; rank: string }[];
  cons?: string[];
}> {
  try {
    const ai = getAI();
    
    const prompt = `You are an expert global demographer and storyteller. A user is being "reborn" in ${countryName}.
      
      CRITICAL INSTRUCTION: You MUST select a real, distinct, and major city specifically within ${countryName}. 
      Do NOT select Mumbai unless the country is India. 
      Do NOT provide a generic response like "The Capital".
      
      Please provide:
      1. A specific major city in ${countryName}.
      2. A "Survival & Quality of Life" index percentage (0-100%) based on current data for that country.
      3. A "Social Class" simulation: "Low", "Medium", or "High".
      4. A "Life Narrative": Write a 3-4 sentence evocative story in the first person ("I was born into...") describing your life based on this specific location and social class. Mention a local detail unique to ${countryName}.
      5. Top 3 "Rankings": Identify the country's best global rankings (e.g., "Economy: Top 10", "Healthcare: #1 in region", "Infrastructure: High Quality").
      6. Top 3 "Cons": Identify common challenges or drawbacks of living in ${countryName} (e.g., "High Cost of Living", "Bureacracy", "Climatic Extremes").
      
      Format the response as a JSON object:
      {
        "city": "City Name",
        "survivalProbability": "85%",
        "socialClass": "Medium",
        "insight": "The life narrative story here...",
        "rankings": [
          {"category": "Economy", "rank": "Top 15 Globally"},
          {"category": "Healthcare", "rank": "#1 in Region"},
          {"category": "Infrastructure", "rank": "Elite Tier"}
        ],
        "cons": ["Extreme Humidity", "Expensive Real Estate", "Traffic Congestion"]
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);
    
    return data;
  } catch (error) {
    console.error("Gemini Error:", error);
    // Generic but country-appropriate fallback
    return {
      city: "A Local City",
      survivalProbability: "75%",
      socialClass: "Medium",
      insight: `I was born in a bustling neighborhood in ${countryName}. My early memories are shaped by the local sounds and the unique character of this place, where I now strive to build a future.`,
      rankings: [
        { category: "Community", rank: "Very Strong" },
        { category: "Resilience", rank: "High" }
      ],
      cons: ["Uncertain Future", "Economic Fluctuations"]
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

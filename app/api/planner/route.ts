import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const itinerarySchema: Schema = {
  type: Type.ARRAY,
  description: "A list of itinerary activities for the day.",
  items: {
    type: Type.OBJECT,
    properties: {
      time: {
        type: Type.STRING,
        description: "The time of the activity, e.g., '09:00 AM'.",
      },
      activity: {
        type: Type.STRING,
        description: "A short, engaging title for the activity.",
      },
      location: {
        type: Type.STRING,
        description: "The specific location or area in the city.",
      },
      cost: {
        type: Type.NUMBER,
        description: "Estimated cost in Indian Rupees (INR) for this activity per person. If free, use 0.",
      },
    },
    required: ["time", "activity", "location", "cost"],
  },
};

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-key-here") {
    return NextResponse.json(
      { error: "Gemini API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert local travel guide for GuideGo, an Indian travel marketplace. 
You create engaging, practical, and highly curated itineraries based on user requests.
Always return your response strictly matching the requested JSON schema.
The user wants an itinerary based on this request: "${prompt}".
Create a realistic itinerary. Only return the JSON array, no markdown wrapping, no extra text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
      },
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("No response generated.");
    }

    // Parse the JSON to ensure it's valid before sending it back
    const itinerary = JSON.parse(text);

    return NextResponse.json({ itinerary });
  } catch (error: any) {
    console.error("AI Planner Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate itinerary." },
      { status: 500 }
    );
  }
}

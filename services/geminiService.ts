
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTourNarration = async (locationName: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-end virtual tour guide for a "Virtual Fly" experience. 
      Provide a brief, captivating, and poetic narration (max 60 words) for the traveler arriving at ${locationName}. 
      Use the following context: ${description}. 
      Mention that they are seeing this from a "Bird's Eye View" or "Helicopter" perspective.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini narration error:", error);
    return `Welcome to ${locationName}. A stunning view from the sky awaits you.`;
  }
};

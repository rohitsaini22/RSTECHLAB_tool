import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, NEVER expose API keys on the client side. 
// This should be a backend call.
// For this demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const generateMarketingCopy = async (softwareName: string, category: string): Promise<string> => {
  try {
    if (!apiKey) {
      console.warn("No API Key provided for Gemini");
      return "AI generation unavailable. Please configure API_KEY.";
    }

    const prompt = `Write a catchy, professional, one-paragraph marketing description for a software product named "${softwareName}" in the "${category}" category. Highlight its benefits for enterprise users. Keep it under 60 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};

import { GoogleGenAI } from "@google/genai";

// Initialize the client
// NOTE: In a real app, ensure process.env.API_KEY is defined in your build environment.
// For this demo, we assume it's injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBookInsight = async (title: string, author: string, query: string = "Provide a brief summary and 3 key study points."): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an expert educational assistant.
      Book: "${title}" by ${author}.
      
      User Question: ${query}
      
      Please provide a concise, helpful response formatted in simple Markdown. 
      If asking for a summary, keep it under 150 words. 
      Focus on academic value.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "No insight available at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't retrieve the AI insight right now. Please check your API key.";
  }
};
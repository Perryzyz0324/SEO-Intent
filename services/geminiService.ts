import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, IntentType, KeywordInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeKeywords = async (keywords: KeywordInput[]): Promise<AnalysisResult[]> => {
  if (!keywords || keywords.length === 0) return [];

  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are a world-class SEO Expert and Content Strategist. 
    Your task is to analyze a list of search keywords and classify their user intent into one of three specific categories for an e-commerce context:
    
    1. "Product Page": The user is looking for a specific item to buy (e.g., "Artificial Rose", "Red fake tulip", "iPhone 15 pro max").
    2. "Collection/Category Page": The user is browsing a broad category or a list of items (e.g., "Artificial flowers", "Fake plants", "Outdoor artificial plants").
    3. "Article/Blog Post": The user is looking for information, guides, comparisons, or inspiration (e.g., "How to clean fake flowers", "Best artificial flowers for weddings").

    Use the provided search volume (if available) as a secondary signal (broader terms with huge volume are often Collections).
    Be strict with your classification.
  `;

  // Prepare the data for the prompt
  const inputString = keywords.map(k => `${k.term} (Volume: ${k.volume || 'N/A'})`).join('\n');

  const prompt = `Classify the following keywords based on their SEO intent:\n\n${inputString}`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              intent: { 
                type: Type.STRING, 
                enum: [
                  IntentType.PRODUCT,
                  IntentType.COLLECTION,
                  IntentType.ARTICLE
                ] 
              },
              reasoning: { type: Type.STRING, description: "Brief explanation (max 10 words) of why this intent was chosen." },
              confidenceScore: { type: Type.INTEGER, description: "Confidence level from 1 to 100" }
            },
            required: ["keyword", "intent", "reasoning", "confidenceScore"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("No response from Gemini.");

    const parsedResults = JSON.parse(rawText) as AnalysisResult[];
    
    // Map back to preserve original volume data if the AI didn't return it perfectly aligned
    // (Though typically it will, we merge to be safe)
    return parsedResults.map(res => {
      const original = keywords.find(k => k.term.toLowerCase() === res.keyword.toLowerCase()) || { volume: 0 };
      return {
        ...res,
        volume: original.volume || 0
      };
    });

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to classify keywords. Please check your API key or try a smaller batch.");
  }
};

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingSource } from "../types";

// Fix: Per Gemini guidelines, initialize with API_KEY from environment variables directly, assuming it is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface GeminiResponse {
    text: string;
    sources: GroundingSource[];
}

export const runStandardChat = async (prompt: string): Promise<GeminiResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return { text: response.text, sources: [] };
    } catch (error) {
        console.error("Gemini API Error (Standard):", error);
        return { text: "Sorry, I encountered an error. Please try again.", sources: [] };
    }
};

export const runGroundedChat = async (prompt: string): Promise<GeminiResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri,
                title: chunk.web?.title,
            }))
            .filter((source: GroundingSource) => source.uri && source.title);

        return { text: response.text, sources };
    } catch (error) {
        console.error("Gemini API Error (Grounded):", error);
        return { text: "Sorry, I encountered an error with the grounded search. Please try again.", sources: [] };
    }
};

export const runThinkingChat = async (prompt: string): Promise<GeminiResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });
        return { text: response.text, sources: [] };
    } catch (error) {
        console.error("Gemini API Error (Thinking):", error);
        return { text: "Sorry, I encountered an error during deep analysis. Please try again.", sources: [] };
    }
};

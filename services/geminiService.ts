import { GroundingSource, ChatMode } from "../types";
import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface GeminiResponse {
    text: string;
    sources: GroundingSource[];
}

export const runChat = async (prompt: string, mode: ChatMode): Promise<GeminiResponse> => {

    // DEBUG
    console.log(`Prompt received by runChat in geminiServie: ${prompt}`)

    // Construct the full URL
    const API_URL = `${API_BASE_URL}/api/chat`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, mode }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend Error:", response.status, data);
            throw new Error(data.text || `Server responded with status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("Chat Service Error:", error);
        const message = error instanceof Error ? error.message : "An unknown network error occurred.";
        return { text: `Sorry, I encountered an error. ${message}`, sources: [] };
    }
};

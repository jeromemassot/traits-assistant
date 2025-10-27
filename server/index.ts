import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { Firestore } from '@google-cloud/firestore';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { isSetIterator } from 'util/types';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize @google/genai client using API_KEY from environment variables as per guidelines.
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable not set. Exiting.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Firestore
const firestore = new Firestore(
    {
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        databaseId: 'traits'
    }
);

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// Endpoint for search
app.post('/api/search', async (req, res) => {
    const { query, type, isScientific } = req.body;

    console.log(query, type, isScientific)

    if (!query) {
        return res.status(400).json({ message: 'Query is required' });
    }

    try {
        let collectionName = '';
        if (type === 'species') {
            collectionName = isScientific ? 'per-scientific-name' : 'per-vernacular-name';
        } else if (type === 'phylo') {
            collectionName = 'phylogenetic-tree';
        }

        if (!collectionName) {
            return res.status(400).json({ message: 'Invalid search type' });
        }

        const collectionRef = firestore.collection(collectionName);
        const snapshot = await collectionRef.where('Document name', '==', query).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No results found' });
        }

        const result = snapshot.docs[0].data();
        res.json(result);

    } catch (error) {
        console.error('Firestore Search Error:', error);
        res.status(500).send('Failed to fetch data from Firestore');
    }
});

// Endpoint for Gemini chat
app.post('/api/chat', async (req, res) => {
    const { prompt, mode } = req.body;

    // DEBUG
    console.log('Server found for chat ...')

    if (!prompt) {
        return res.status(400).json({ text: 'Prompt is required', sources: [] });
    }

    try {
        let model: string;
        let config: any = {
            maxOutputTokens: 8192,
            temperature: 0.7,
            topP: 1.0,
            topK: 32,
        };
        let tools: any[] = [];

        switch (mode) {
            case 'grounded':
                model = 'gemini-2.5-flash';
                tools = [{ googleSearch: {} }];
                break;
            case 'thinking':
                model = 'gemini-2.5-pro';
                config.temperature = 0;
                config.thinkingConfig = { thinkingBudget: 32768 };
                break;
            case 'standard':
            default:
                model = 'gemini-2.5-flash';
                break;
        }
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { 
                ...config, 
                safetySettings,
                tools: tools.length > 0 ? tools : undefined
            }
        });

        // DEBUG
        console.log(response)
        
        // Use response.text accessor for simpler text extraction.
        const text = response.text;
        
        // Extract grounding sources from groundingChunks as per guidelines.
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = groundingChunks
            ?.filter(chunk => chunk.web?.uri && chunk.web?.title)
            .map(chunk => ({
                uri: chunk.web!.uri!,
                title: chunk.web!.title!
            })) || [];

        res.json({ text, sources });

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ text: `An error occurred while processing your request: ${error.message}`, sources: [] });
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

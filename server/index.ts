
import express from 'express';
import cors from 'cors';
// FIX: Switched from @google-cloud/vertexai to @google/genai to align with coding guidelines.
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { Storage } from '@google-cloud/storage';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// FIX: Initialize @google/genai client using API_KEY from environment variables as per guidelines.
// The GCS client will continue to use Application Default Credentials.
if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set. Exiting.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const project = process.env.GOOGLE_CLOUD_PROJECT;

if (!project) {
    console.error("GOOGLE_CLOUD_PROJECT environment variable not set. Exiting.");
    process.exit(1);
}

const storage = new Storage({ projectId: project });

const BUCKET_NAME = 'eol_dataset';
const DATA_FILES = {
    vernacular: 'traits/traits_assistant_data/traits/per-species/traits_per_vernacular_name.json',
    scientific: 'traits/traits_assistant_data/traits/per-species/traits_per_scientific_name.json',
    phylo: 'traits/traits_assistant_data/traits/statistics/most_common_traits_patterns.json'
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// Endpoint to proxy data from GCS, authenticated via service account
app.get('/api/data/:type', async (req, res) => {
    const { type } = req.params;
    const filePath = DATA_FILES[type as keyof typeof DATA_FILES];

    if (!filePath) {
        return res.status(404).send('Data type not found');
    }

    try {
        const file = storage.bucket(BUCKET_NAME).file(filePath);
        res.setHeader('Content-Type', 'application/json');
        file.createReadStream()
            .on('error', (err) => {
                console.error(`Error streaming file from GCS: ${filePath}`, err);
                res.status(500).send('Error reading data file');
            })
            .pipe(res);
    } catch (error) {
        console.error('GCS Fetch Error:', error);
        res.status(500).send('Failed to fetch data from storage');
    }
});

// Endpoint for Gemini chat
app.post('/api/chat', async (req, res) => {
    const { prompt, mode } = req.body;

    if (!prompt) {
        return res.status(400).json({ text: 'Prompt is required', sources: [] });
    }

    try {
        // FIX: Refactored to use ai.models.generateContent and updated model names and configs
        // to align with @google/genai SDK guidelines.
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
            config: { ...config, safetySettings },
            tools: tools.length > 0 ? tools : undefined,
        });
        
        // FIX: Use response.text accessor for simpler text extraction.
        const text = response.text;
        
        // FIX: Extract grounding sources from groundingChunks as per guidelines.
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

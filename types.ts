export type SearchResult =
    | { type: 'species'; query: string; data: Record<string, any> }
    | { type: 'phylo'; query: string; data: Record<string, any> }
    | { type: 'notFound'; data: string }
    | { type: 'error'; data: string }
    | { type: 'info'; data: string };

export interface GroundingSource {
    uri: string;
    title: string;
}

export type ChatMode = 'standard' | 'grounded' | 'thinking';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    sources?: GroundingSource[];
    mode?: ChatMode;
}

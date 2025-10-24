import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatMode } from '../types';
import { runChat } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const WELCOME_MESSAGE: ChatMessage = {
    id: 'initial-welcome',
    sender: 'bot',
    mode: 'standard',
    text: `### Welcome to the Traits Assistant!
    
You can ask me questions about:
- Species traits found in our databases.
- Statistical patterns in the trait data.
- Use **Grounded Search** to find up-to-date information.
- Use **Deep Analysis** for complex queries and to expand on existing data.`
};

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);

const modeStyles: Record<ChatMode, { chip: string; activeChip: string; messageBg: string }> = {
  standard: {
    chip: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    activeChip: 'bg-blue-500 text-white',
    messageBg: 'bg-blue-100',
  },
  grounded: {
    chip: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    activeChip: 'bg-amber-500 text-white',
    messageBg: 'bg-amber-100',
  },
  thinking: {
    chip: 'bg-violet-100 text-violet-800 hover:bg-violet-200',
    activeChip: 'bg-violet-500 text-white',
    messageBg: 'bg-violet-100',
  },
};

export const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatMode, setChatMode] = useState<ChatMode>('standard');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([WELCOME_MESSAGE]);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleReset = () => {
        setMessages([WELCOME_MESSAGE]);
        setInput('');
        setChatMode('standard');
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const response = await runChat(currentInput, chatMode);
        
        const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: response.text,
            sources: response.sources.length > 0 ? response.sources : undefined,
            mode: chatMode,
        };
        setMessages(prev => [...prev, botMessage]);

        setIsLoading(false);
    };
    
    const getBotMessageBg = (mode?: ChatMode) => {
        if (!mode) return 'bg-slate-200';
        return modeStyles[mode].messageBg;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex flex-col h-[40rem]">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm text-slate-600 mb-2 font-medium">Select a chat mode:</p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setChatMode('standard')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${chatMode === 'standard' ? modeStyles.standard.activeChip : modeStyles.standard.chip}`}>Standard</button>
                        <button onClick={() => setChatMode('grounded')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${chatMode === 'grounded' ? modeStyles.grounded.activeChip : modeStyles.grounded.chip}`}>Grounded Search</button>
                        <button onClick={() => setChatMode('thinking')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${chatMode === 'thinking' ? modeStyles.thinking.activeChip : modeStyles.thinking.chip}`}>Deep Analysis</button>
                    </div>
                </div>
                <button onClick={handleReset} title="Reset chat" className="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
                    <ResetIcon />
                </button>
            </div>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 -mr-4 mb-4 border border-slate-200 rounded-md p-4 bg-slate-50/50">
                {messages.map(message => (
                    <div key={message.id} className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${message.sender === 'user' ? 'bg-slate-800 text-white' : `${getBotMessageBg(message.mode)} text-slate-800`}`}>
                            <div className="prose prose-sm prose-slate max-w-none text-left">
                                <ReactMarkdown>{message.text}</ReactMarkdown>
                            </div>
                            {message.sources && message.sources.length > 0 && (
                                <div className={`mt-2 border-t pt-2 ${message.sender === 'user' ? 'border-slate-600' : 'border-slate-300/70'}`}>
                                    <h4 className="text-xs font-bold mb-1">Sources:</h4>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        {message.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className={`underline ${message.sender === 'user' ? 'hover:text-slate-300' : 'hover:text-slate-500'}`}>
                                                    {source.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className={`p-3 rounded-lg max-w-md ${getBotMessageBg(chatMode)} text-slate-800`}>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage}>
                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-grow block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Ask about traits, species, or patterns..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};
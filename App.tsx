
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { SpeciesSearch } from './components/SpeciesSearch';
import { PhyloSearch } from './components/PhyloSearch';
import { SearchResult } from './types';
import { SearchResultsDisplay } from './components/SearchResultsDisplay';
import { DeepmindIcon, SmithsonianIcon } from './components/Icons';
import { Chatbot } from './components/Chatbot';
import { search } from './services/firestoreService';

const App: React.FC = () => {
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSpeciesSearch = useCallback(async (query: string, isScientific: boolean, isFuzzy: boolean) => {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            setSearchResults(null);
            return;
        }

        if (isFuzzy) {
            // Placeholder for fuzzy search logic
            setSearchResults({ type: 'info', data: `Fuzzy search for "${query}" is not yet implemented.` });
            return;
        }

        setLoading(true);
        try {
            const result = await search(searchTerm, 'species', isScientific);
            setSearchResults({ type: 'species', query: query, data: result });
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults({ type: 'notFound', data: `No results found for "${query}".` });
        } finally {
            setLoading(false);
        }
    }, []);

    const handlePhyloSearch = useCallback(async (query: string) => {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            setSearchResults(null);
            return;
        }

        setLoading(true);
        try {
            const result = await search(searchTerm, 'phylo', false);
            setSearchResults({ type: 'phylo', query: query, data: result });
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults({ type: 'notFound', data: `No results found for "${query}".` });
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                        Traits Search & Patterns Analysis
                    </h1>
                    <div className="flex justify-left items-center gap-8 my-6">
                        <DeepmindIcon />
                        <SmithsonianIcon />
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="space-y-6 sticky top-24">
                             <StatCard title="Traits with Vernacular or Scientific names" value="2,171,126" />
                             <StatCard title="Traits with Vernacular and Scientific names" value="1,908,769" />
                             <StatCard title="Phylogenetic Tree Levels with Traits" value="58,849" />
                        </div>
                    </aside>
                    
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SpeciesSearch onSearch={handleSpeciesSearch} disabled={loading} />
                            <PhyloSearch onSearch={handlePhyloSearch} disabled={loading} />
                        </div>

                        <div className="mt-8">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p className="text-lg text-slate-600">Searching...</p>
                                </div>
                            ) : (
                                <SearchResultsDisplay results={searchResults} />
                            )}
                        </div>
                        
                        <div className="mt-12">
                            <Chatbot />
                        </div>
                    </div>
                </div>

                <div className="mt-12 p-4 bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-center max-w-5xl mx-auto">
                    <p>All the data used in this application has been extracted from the Encyclopedia of Life 
                        (<a href="https://naturalhistory.si.edu/research/eol" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-600">
                            https://naturalhistory.si.edu/research/eol
                        </a>)
                    </p>
                </div>
            </main>
        </div>
    );
};

export default App;
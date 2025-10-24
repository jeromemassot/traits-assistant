import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { SpeciesSearch } from './components/SpeciesSearch';
import { PhyloSearch } from './components/PhyloSearch';
import { SearchResult } from './types';
import { SearchResultsDisplay } from './components/SearchResultsDisplay';
import { EOLIcon, SmithsonianIcon } from './components/Icons';
import { Chatbot } from './components/Chatbot';

const App: React.FC = () => {
    const [vernacularData, setVernacularData] = useState<Record<string, any> | null>(null);
    const [scientificData, setScientificData] = useState<Record<string, any> | null>(null);
    const [phyloData, setPhyloData] = useState<Record<string, any> | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vernacularRes, scientificRes, phyloRes] = await Promise.all([
                    fetch('/api/data/vernacular'),
                    fetch('/api/data/scientific'),
                    fetch('/api/data/phylo')
                ]);

                if (!vernacularRes.ok || !scientificRes.ok || !phyloRes.ok) {
                    throw new Error(`A data fetch failed with status: ${vernacularRes.status}, ${scientificRes.status}, ${phyloRes.status}`);
                }

                setVernacularData(await vernacularRes.json());
                setScientificData(await scientificRes.json());
                setPhyloData(await phyloRes.json());
            } catch (error) {
                console.error("Failed to load data:", error);
                setSearchResults({ type: 'error', data: 'Failed to load species data from the server.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSpeciesSearch = useCallback((query: string, isScientific: boolean, isFuzzy: boolean) => {
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

        const data = isScientific ? scientificData : vernacularData;
        const result = data?.[searchTerm];

        if (result) {
            setSearchResults({ type: 'species', query: query, data: result });
        } else {
            setSearchResults({ type: 'notFound', data: `No results found for "${query}".` });
        }
    }, [scientificData, vernacularData]);

    const handlePhyloSearch = useCallback((query: string) => {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            setSearchResults(null);
            return;
        }
        const result = phyloData?.[searchTerm];
        if (result) {
            setSearchResults({ type: 'phylo', query: query, data: result });
        } else {
            setSearchResults({ type: 'notFound', data: `No results found for "${query}".` });
        }
    }, [phyloData]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                        Traits Search & Patterns Analysis
                    </h1>
                    <div className="flex justify-center items-center gap-4 my-6">
                        <EOLIcon />
                        <SmithsonianIcon />
                    </div>
                    <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                        Use the search engine to find the traits information for EOL.org species.
                    </p>
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
                            <SearchResultsDisplay results={searchResults} />
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
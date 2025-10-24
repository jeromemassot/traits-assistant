import React, { useState } from 'react';

interface PhyloSearchProps {
    onSearch: (query: string) => void;
    disabled: boolean;
}

export const PhyloSearch: React.FC<PhyloSearchProps> = ({ onSearch, disabled }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-grow">
                    <label htmlFor="phylo-level" className="block text-base font-medium text-slate-700">
                        Phylogenetic Tree Level
                    </label>
                    <input
                        type="text"
                        id="phylo-level"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="e.g., Felidae"
                        disabled={disabled}
                    />
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={disabled}
                        className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ring-1 ring-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
};
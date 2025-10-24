import React, { useState } from 'react';

interface SpeciesSearchProps {
    onSearch: (query: string, isScientific: boolean, isFuzzy: boolean) => void;
    disabled: boolean;
}

export const SpeciesSearch: React.FC<SpeciesSearchProps> = ({ onSearch, disabled }) => {
    const [query, setQuery] = useState('');
    const [isScientific, setIsScientific] = useState(false);
    const [isFuzzy, setIsFuzzy] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, isScientific, isFuzzy);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-full">
            <form onSubmit={handleSubmit}>
                <label htmlFor="species-name" className="block text-base font-medium text-slate-700">
                    Species name (scientific or vernacular)
                </label>
                <input
                    type="text"
                    id="species-name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Lion or Panthera leo"
                    disabled={disabled}
                />
                <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                        <input
                            id="is-scientific"
                            type="checkbox"
                            checked={isScientific}
                            onChange={(e) => setIsScientific(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            disabled={disabled}
                        />
                        <label htmlFor="is-scientific" className="ml-2 block text-base text-slate-900">
                            Is a scientific name?
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="fuzzy-search"
                            type="checkbox"
                            checked={isFuzzy}
                            onChange={(e) => setIsFuzzy(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            disabled={disabled}
                        />
                        <label htmlFor="fuzzy-search" className="ml-2 block text-base text-slate-900">
                            Fuzzy search
                        </label>
                    </div>
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

import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsDisplayProps {
    results: SearchResult | null;
}

const renderData = (data: any) => {
    return (
        <ul className="list-disc list-inside space-y-1 text-slate-600">
            {Object.entries(data).map(([key, value]) => (
                <li key={key}>
                    <span className="font-semibold text-slate-800">{key.replace(/_/g, ' ')}:</span>{' '}
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                </li>
            ))}
        </ul>
    );
}

export const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({ results }) => {
    if (!results) return null;

    let content;
    let title: string = '';

    switch (results.type) {
        case 'species':
        case 'phylo':
            title = `Results for "${results.query}"`;
            content = renderData(results.data);
            break;
        case 'notFound':
        case 'error':
        case 'info':
            content = <p className="text-slate-600">{results.data}</p>;
            break;
        default:
            return null;
    }

    const cardColor = results.type === 'error' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white';

    return (
        <div className={`mt-6 p-6 rounded-lg shadow-md border ${cardColor} transition-all duration-300`}>
            {title && <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>}
            {content}
        </div>
    );
};

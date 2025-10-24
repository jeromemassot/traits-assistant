
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 text-center">
            <h3 className="text-sm font-medium text-slate-500 truncate">{title}</h3>
            <p className="mt-1 text-4xl font-bold text-slate-900">{value}</p>
        </div>
    );
};

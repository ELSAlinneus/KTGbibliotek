'use client'

import { useState } from 'react';

type SearchbarProps = {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function Searchbar({ onSearch, placeholder = "Sök..." }: SearchbarProps) {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className="flex items-center gap-2 w-full max-w-md relative flex-1 mx-auto mb-4 max-w-none mx-0 ">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-200"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
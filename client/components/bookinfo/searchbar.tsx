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
        <div className="flex items-center gap-2 w-full max-w-md relative flex-1 mx-auto mb-4">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
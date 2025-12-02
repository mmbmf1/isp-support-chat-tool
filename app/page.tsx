'use client';

import { useState, FormEvent } from 'react';

interface SearchResult {
    id: number;
    title: string;
    description: string;
    similarity?: number;
}

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!query.trim()) {
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Search failed');
            }

            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                        Troubleshooting Search
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Enter your troubleshooting query to find similar scenarios
                    </p>
                    
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., router light is red"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                        Searching...
                    </div>
                )}

                {results.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Top {results.length} Results
                        </h2>
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {result.title}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {result.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && results.length === 0 && query && !error && (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                        No results found. Try a different query.
                    </div>
                )}
            </div>
        </div>
    );
}

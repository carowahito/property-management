'use client';

import { useState } from 'react';

interface QueryResult {
  query: string;
  answer: string;
  context: string[];
}

export default function AIQueryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);

  const exampleQueries = [
    'What is my current occupancy rate?',
    'Which properties have declining occupancy?',
    'Show me revenue trends for the last 6 months',
    'How many maintenance requests are pending?',
    'Which tenants have payment issues?',
    'What are my top performing properties?',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResults([data, ...results]);
      setQuery('');
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center justify-center gap-2">
            <span className="text-3xl">🔍</span> AI Query Assistant
          </h1>
          <p className="text-neutral-600 mt-2">
            Ask questions about your property portfolio in natural language
          </p>
        </div>

        {/* Query Input */}
        <div className="bg-surface rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything about your properties..."
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Thinking...</span>
                  </div>
                ) : (
                  'Ask'
                )}
              </button>
            </div>
          </form>

          {/* Example Queries */}
          <div className="mt-4">
            <p className="text-sm text-neutral-600 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="text-sm px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, idx) => (
              <div key={idx} className="bg-surface rounded-lg shadow p-6">
                {/* Question */}
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                    Q
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-neutral-900">{result.query}</p>
                  </div>
                </div>

                {/* Answer */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-success-600 text-white rounded-full flex items-center justify-center font-semibold">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-neutral-700 whitespace-pre-line">{result.answer}</p>
                    </div>
                    {result.context && result.context.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <p className="text-xs text-neutral-500">
                          Context used:{' '}
                          {result.context.map((c, i) => (
                            <span key={i}>
                              {i > 0 && ', '}
                              <span className="font-medium">{c}</span>
                            </span>
                          ))}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <div className="bg-surface rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Ask Your First Question
            </h3>
            <p className="text-neutral-600 mb-6">
              I can help you understand your property portfolio data, identify trends, and make
              informed decisions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-primary-900 mb-2">📊 Analytics</h4>
                <p className="text-sm text-primary-800">
                  Ask about revenue, occupancy rates, trends, and performance metrics
                </p>
              </div>
              <div className="p-4 bg-success-50 rounded-lg">
                <h4 className="font-semibold text-success-900 mb-2">🏠 Properties</h4>
                <p className="text-sm text-green-800">
                  Get information about specific properties, units, and their performance
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">👥 Tenants</h4>
                <p className="text-sm text-purple-800">
                  Query tenant information, payment status, and lease details
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">🔧 Maintenance</h4>
                <p className="text-sm text-yellow-800">
                  Check maintenance requests, costs, and work order status
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

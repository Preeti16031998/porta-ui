'use client';

import { useState } from 'react';

export default function TestWatchlist() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('TestWatchlist - Making direct fetch request');
      const response = await fetch('http://localhost:8000/api/v1/watchlist?user_id=f00dc8bd-eabc-4143-b1f0-fbcb9715a02e&page=1&size=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'f00dc8bd-eabc-4143-b1f0-fbcb9715a02e',
          'X-User-Authenticated': 'true',
        },
      });
      
      console.log('TestWatchlist - Response status:', response.status);
      console.log('TestWatchlist - Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('TestWatchlist - Response data:', data);
      
      setResult({ success: true, data });
    } catch (err: any) {
      console.error('TestWatchlist - Error:', err);
      setError(err.message);
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded border m-4">
      <h3 className="text-lg font-bold mb-4">API Test</h3>
      
      <button 
        onClick={testDirectFetch}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Direct API Call'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <strong>Result:</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

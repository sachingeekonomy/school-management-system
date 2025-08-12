"use client";

import { useState, useEffect } from 'react';

interface SQLDebugResponse {
  success: boolean;
  message: string;
  results: {
    connectionTest: any[];
    tables: any[];
    teacherColumns: any[];
    teacherCount: any[];
    teachersRaw: any[];
    teacherVariations: any[];
  };
  debug: {
    database: string;
    timestamp: string;
  };
}

const SQLDebugPage = () => {
  const [data, setData] = useState<SQLDebugResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug/sql');
        const result = await response.json();
        
        if (response.ok) {
          setData(result);
        } else {
          setError(result.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running SQL debug queries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">SQL Debug Information</h1>
        
        {data && (
          <div className="space-y-6">
            {/* Connection Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
              <div className="bg-green-50 p-4 rounded-lg">
                <pre className="text-sm text-green-800">
                  {JSON.stringify(data.results.connectionTest, null, 2)}
                </pre>
              </div>
            </div>

            {/* Available Tables */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Available Tables</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <pre className="text-sm text-blue-800">
                  {JSON.stringify(data.results.tables, null, 2)}
                </pre>
              </div>
            </div>

            {/* Teacher Table Structure */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Teacher Table Structure</h2>
              <div className="bg-purple-50 p-4 rounded-lg">
                <pre className="text-sm text-purple-800">
                  {JSON.stringify(data.results.teacherColumns, null, 2)}
                </pre>
              </div>
            </div>

            {/* Teacher Count */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Teacher Count (Raw SQL)</h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <pre className="text-sm text-yellow-800">
                  {JSON.stringify(data.results.teacherCount, null, 2)}
                </pre>
              </div>
            </div>

            {/* Teachers Raw SQL */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Teachers (Raw SQL)</h2>
              <div className="bg-orange-50 p-4 rounded-lg">
                <pre className="text-sm text-orange-800">
                  {JSON.stringify(data.results.teachersRaw, null, 2)}
                </pre>
              </div>
            </div>

            {/* Table Name Variations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Table Name Variations</h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <pre className="text-sm text-red-800">
                  {JSON.stringify(data.results.teacherVariations, null, 2)}
                </pre>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-800">
                  {JSON.stringify(data.debug, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SQLDebugPage;

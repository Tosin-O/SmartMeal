// app/(users)/test-recommendation/page.tsx
'use client';

import { useState } from 'react';

export default function TestRecommendation() {
  const [budget, setBudget] = useState(5000);
  const [uid, setUid] = useState('test-user-123'); // <--- ADDED UID STATE
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPipeline = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // --- ADD UID TO BODY ---
        body: JSON.stringify({ budgetGoal: budget, uid: uid }) 
      });
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Live Database AHP-TOPSIS Tester</h1>
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test User UID (Firebase Auth ID):</label>
          <input 
            type="text" 
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="border p-2 rounded text-white w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Budget Limit (₦):</label>
          <input 
            type="number" 
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="border p-2 rounded text-white w-full"
          />
        </div>

        <button 
          onClick={testPipeline}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          {loading ? 'Fetching from Firebase & Calculating...' : 'Run Algorithm'}
        </button>
      </div>

      {results && (
        <div className="bg-gray-100 p-4 rounded text-black overflow-auto max-h-96">
          <h2 className="font-semibold mb-2">Algorithm Output:</h2>
          <pre className="text-sm">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
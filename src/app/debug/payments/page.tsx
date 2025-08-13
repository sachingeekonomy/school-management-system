"use client";

import { useState } from "react";

export default function DebugPaymentsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/check-payments");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to check payments" });
    } finally {
      setLoading(false);
    }
  };

  const createTestPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/create-test-payments", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to create test payments" });
    } finally {
      setLoading(false);
    }
  };

  const testRazorpay = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/test-razorpay");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to test Razorpay" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Debug Page</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={checkPayments}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Loading..." : "Check Payments"}
        </button>
        
        <button
          onClick={createTestPayments}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded ml-4 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Test Payments"}
        </button>
        
        <button
          onClick={testRazorpay}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded ml-4 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Razorpay"}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

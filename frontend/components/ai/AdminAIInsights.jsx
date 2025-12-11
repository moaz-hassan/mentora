"use client";

import { useState, useEffect } from "react";

export default function AdminAIInsights({ platformData }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (platformData) {
      fetchInsights();
    }
  }, [platformData]);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: JSON.stringify(platformData),
          analysisType: "insights",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInsights(data.analysis);
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Insights</h3>
        <p className="text-gray-600">Analyzing platform data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI Platform Insights</h3>
      </div>
      
      {insights ? (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap">{insights}</p>
        </div>
      ) : (
        <p className="text-gray-600">No insights available at this time.</p>
      )}

      <button
        onClick={fetchInsights}
        className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        Refresh Insights
      </button>
    </div>
  );
}

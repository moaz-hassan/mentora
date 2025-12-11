"use client";

import { useState } from "react";

export default function AIContentSuggestions({ contentType = "course", onApplySuggestion }) {
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const generateSuggestions = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `Generate ${contentType} content suggestions for: ${prompt}`,
          context: {
            page: "content-creation",
            data: { contentType },
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.response);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">AI Content Assistant</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What would you like help with?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., 'Create a course description for a beginner Python course' or 'Suggest quiz questions about JavaScript arrays'"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={generateSuggestions}
          disabled={loading || !prompt.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Suggestions"}
        </button>

        {suggestions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">AI Suggestions</h4>
              {onApplySuggestion && (
                <button
                  onClick={() => onApplySuggestion(suggestions)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Apply
                </button>
              )}
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{suggestions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

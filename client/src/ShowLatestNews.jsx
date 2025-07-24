import React, { useState } from "react";
import axios from "axios";

export default function ShowLatestNews() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/news");
      setHeadlines(res.data);
    } catch {
      setHeadlines([]);
      alert("Failed to fetch news.");
    }
    setLoading(false);
  };

  return (
    <div className="my-8 flex flex-col items-center">
      <button
        onClick={fetchNews}
        className="mb-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
        disabled={loading}
      >
        {loading ? "Loading..." : "Show Latest News"}
      </button>
      <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
        {headlines.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-lg transition"
          >
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-700 hover:underline"
            >
              {item.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
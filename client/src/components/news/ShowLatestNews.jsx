import React, { useState } from "react";
import axios from "axios";
import { motion } from 'framer-motion';

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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-300">
        Latest Headlines
      </h3>
      
      <button
        onClick={fetchNews}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 
                 text-white font-medium rounded-lg shadow-md hover:shadow-lg 
                 transform hover:scale-[1.02] transition-all duration-200"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          <span>Show Latest News</span>
        )}
      </button>

      <div className="space-y-3">
        {headlines.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-3 shadow 
                     hover:shadow-md transition-all group"
          >
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-purple-600 dark:text-purple-300 
                       hover:text-purple-700 dark:hover:text-purple-200 
                       cursor-pointer block transition-colors"
            >
              {item.title}
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
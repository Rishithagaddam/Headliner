import React, { useState } from "react";
import axios from "axios";

const CATEGORY_OPTIONS = [
  { label: "General", value: "general" },
  { label: "Technology", value: "technology" },
  { label: "Sports", value: "sports" },
  { label: "Business", value: "business" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Health", value: "health" },
  { label: "Science", value: "science" },
];

// Replace the dummy getSummary function with this real one
async function getSummary(headline, description) {
  try {
    const response = await axios.post('http://localhost:5000/generate-summary', {
      headline,
      description
    });
    return response.data.summary;
  } catch (error) {
    console.error('Error getting summary:', error);
    return 'Unable to generate summary';
  }
}

export default function CategoryNewsFilter() {
  const [category, setCategory] = useState("");
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState({});
  const [openSummary, setOpenSummary] = useState({}); // {idx: true/false}
  const [summaryLoading, setSummaryLoading] = useState({}); // {idx: true/false}

  const fetchCategoryNews = async (cat) => {
    setLoading(true);
    setHeadlines([]);
    setSummaries({});
    setOpenSummary({});
    setSummaryLoading({});
    try {
      const query =
        cat === "general"
          ? "top news india"
          : `top ${cat} news india`;
      const res = await axios.get("http://localhost:5000/api/news", {
        params: { q: query },
      });
      setHeadlines(res.data);
    } catch {
      setHeadlines([]);
    }
    setLoading(false);
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    if (cat) fetchCategoryNews(cat);
    else setHeadlines([]);
  };

  const handleSummaryToggle = async (idx, headline) => {
    setOpenSummary((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));

    // If summary exists or is being hidden, return
    if (summaries[idx] || openSummary[idx]) return;

    setSummaryLoading((prev) => ({ ...prev, [idx]: true }));

    try {
      // Extract a brief description from the headline
      const description = headline
        .split(':')
        .slice(1)
        .join(':')
        .trim();

      const summary = await getSummary(headline, description);
      
      // Validate summary quality
      const isValidSummary = summary && 
        summary !== "No summary available" && 
        summary.length > 10;

      setSummaries((prev) => ({
        ...prev,
        [idx]: isValidSummary ? summary : `Key point: ${description || headline}`
      }));
    } catch (error) {
      console.error('Summary generation failed:', error);
      setSummaries((prev) => ({
        ...prev,
        [idx]: `Key point: ${headline.split(':').pop().trim()}`
      }));
    }

    setSummaryLoading((prev) => ({ ...prev, [idx]: false }));
  };

  return (
    <div className="mt-10 mb-8 w-full max-w-md mx-auto bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-lg backdrop-blur-md p-6 border border-white/40 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-center mb-4 text-indigo-600 flex items-center justify-center gap-2">
        <span role="img" aria-label="category">📢</span> Category News Filter
      </h2>
      <select
        id="category"
        className="rounded-md border border-gray-300 p-2 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white/80 dark:bg-gray-800/80"
        value={category}
        onChange={handleCategoryChange}
      >
        <option value="">Select a category...</option>
        {CATEGORY_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div>
        {loading ? (
          <div className="text-center text-indigo-500 py-4">Loading...</div>
        ) : (
          category && (
            <ul className="space-y-4">
              {headlines.map((item, idx) => (
                <li
                  key={idx}
                  className="bg-white/90 dark:bg-gray-800/80 rounded-xl px-4 py-3 shadow hover:bg-indigo-50 dark:hover:bg-indigo-900 transition cursor-pointer"
                >
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 dark:text-indigo-300 font-semibold hover:underline block"
                  >
                    {item.title}
                  </a>
                  <button
                    className="mt-3 mb-1 px-3 py-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded transition text-xs font-medium"
                    onClick={() => handleSummaryToggle(idx, item.title)}
                  >
                    {openSummary[idx] ? "Hide Summary" : "Smart Summary"}
                  </button>
                  {/* Accordion summary */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSummary[idx] ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                    }`}
                  >
                    {summaryLoading[idx] ? (
                      <div className="text-xs text-indigo-400 py-2">Summarizing...</div>
                    ) : summaries[idx] ? (
                      <div className="text-sm text-gray-700 dark:text-gray-200 bg-indigo-50 dark:bg-indigo-950 rounded p-3 mt-1">
                        {summaries[idx]}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
              {!loading && headlines.length === 0 && (
                <li className="text-gray-400 text-center py-4">No news found for this category.</li>
              )}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
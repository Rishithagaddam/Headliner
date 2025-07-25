import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { summarizeNewsContent, generateFollowUpQuestions } from '../../services/geminiService';
import axios from 'axios';

export default function NewsCard({ article, delay }) {
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    setLoading(true);
    try {
      // Use the new Gemini service for better summarization
      const content = article.description || article.title;
      const geminiSummary = await summarizeNewsContent(content);
      setSummary(geminiSummary);
      
      // Generate follow-up questions
      const questions = await generateFollowUpQuestions(article.title, geminiSummary);
      setFollowUpQuestions(questions);
      
      setShowSummary(true);
    } catch (err) {
      console.error('Error fetching summary:', err);
      // Fallback to server endpoint
      try {
        const response = await axios.post('http://localhost:5000/generate-summary', {
          headline: article.title,
          description: article.description || article.title
        });
        setSummary(response.data.summary);
        setShowSummary(true);
      } catch (serverErr) {
        setSummary('Failed to generate summary');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 dark:bg-gray-800/80 rounded-xl overflow-hidden shadow-lg 
                 hover:shadow-xl transition-all duration-200 group"
    >
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt={article.title}
          className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
          onError={(e) => e.target.style.display = 'none'}
        />
      )}
      
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 line-clamp-2">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline cursor-pointer block transition-colors
                     hover:text-purple-800 dark:hover:text-purple-200"
          >
            {article.title}
          </a>
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          <button
            onClick={fetchSummary}
            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 
                     dark:hover:bg-purple-800 rounded-full transition-colors cursor-pointer
                     text-purple-700 dark:text-purple-300 text-xs font-medium
                     hover:shadow-sm active:scale-95"
          >
            {loading ? 'Summarizing...' : showSummary ? 'Hide Summary' : 'Show Summary'}
          </button>
        </div>

        {showSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="text-sm text-gray-600 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
              <strong className="text-purple-700 dark:text-purple-300">Summary:</strong>
              <br />
              {summary}
            </div>
            
            {/* Follow-up Questions */}
            {followUpQuestions.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="font-medium text-purple-600 dark:text-purple-400">💡 Ask about:</div>
                {followUpQuestions.map((question, idx) => (
                  <div key={idx} className="ml-2">• {question}</div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
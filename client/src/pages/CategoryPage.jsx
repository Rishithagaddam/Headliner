import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NewsFilters from '../components/news/NewsFilters';
import NewsCard from '../components/news/NewsCard';
import { useFilters } from '../context/FiltersContext';
import { LOCATIONS } from '../constants/newsConfig';
import axios from 'axios';

export default function CategoryPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { filters } = useFilters();

  useEffect(() => {
    fetchNews(filters);
  }, [filters]);

  const fetchNews = async (currentFilters) => {
    setLoading(true);
    setError(null);

    try {
      const query = buildNewsQuery(currentFilters);
      const response = await axios.get('http://localhost:5000/api/news', {
        params: { q: query }
      });
      setNews(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news. Please try again.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const buildNewsQuery = ({ category, location }) => {
    const locationName = location === 'GLOBAL' ? 'global' : 
                        location === 'EU' ? 'European' : 
                        `${LOCATIONS.find(l => l.code === location)?.name}`;
    
    if (!category || category === 'general') {
      return `top ${locationName} news`;
    }
    return `${locationName} ${category} news`;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 
                    dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-300 mb-4">
            News Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse news by category and region to get AI-powered summaries
          </p>
        </motion.div>

        {/* Filters Section */}
        <NewsFilters onFiltersChange={fetchNews} />

        {/* News Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-300">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading news...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No news found for the selected filters.
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {news.map((item, idx) => (
                <NewsCard 
                  key={idx}
                  article={item}
                  delay={idx * 0.1}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
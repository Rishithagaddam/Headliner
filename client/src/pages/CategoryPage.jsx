import React from 'react';
import CategoryNewsFilter from '../components/news/CategoryNewsFilter';
import { motion } from 'framer-motion';

export default function CategoryPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-300 mb-4">
          News Categories
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Browse news by category and get AI-powered summaries for quick understanding
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CategoryNewsFilter />
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            {
              icon: "🎯",
              title: "Focused Topics",
              description: "Filter news by specific categories that interest you"
            },
            {
              icon: "🤖",
              title: "AI Summaries",
              description: "Get quick, intelligent summaries of each article"
            },
            {
              icon: "🔄",
              title: "Real-time Updates",
              description: "Stay current with latest news in each category"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-purple-100/20"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-300 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
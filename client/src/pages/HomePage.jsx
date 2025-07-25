import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900"
        animate={{ 
          background: [
            "linear-gradient(to right, #f3e7ff, #e3f2ff, #ffe7f9)",
            "linear-gradient(to right, #ffe7f9, #f3e7ff, #e3f2ff)",
            "linear-gradient(to right, #e3f2ff, #ffe7f9, #f3e7ff)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Content */}
      <motion.div 
        className="relative z-10 text-center space-y-8 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-purple-700 dark:text-purple-300">
          <span className="inline-block animate-spin-slow">💠</span> 
          Gemini News Assistant
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your intelligent companion for discovering and understanding news through the power of AI.
          Get concise summaries and engage in meaningful conversations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link 
            to="/chat"
            className="px-8 py-4 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transform hover:scale-105 transition duration-200 flex items-center justify-center gap-2"
          >
            <span>Start Chatting</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
          
          <Link 
            to="/category"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 flex items-center justify-center gap-2"
          >
            <span>Explore Categories</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {[
            {
              icon: "🤖",
              title: "AI-Powered Chat",
              description: "Engage with our intelligent assistant for in-depth news discussions"
            },
            {
              icon: "📰",
              title: "Category Filtering",
              description: "Browse news by topics that matter to you"
            },
            {
              icon: "✨",
              title: "Smart Summaries",
              description: "Get concise TL;DR versions of complex news articles"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import PodcastGenerator from '../components/podcast/PodcastGenerator';

export default function PodcastPage() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 
                    dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PodcastGenerator />
      </motion.div>
    </div>
  );
}

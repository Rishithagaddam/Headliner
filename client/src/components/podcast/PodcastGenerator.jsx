import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES, LOCATIONS } from '../../constants/newsConfig';
import { 
  getAvailableVoices, 
  generatePodcast, 
  getPodcastStreamUrl, 
  getPodcastDownloadUrl 
} from '../../services/podcastService';

export default function PodcastGenerator() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedLocation, setSelectedLocation] = useState('IN');
  const [loading, setLoading] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Load available voices on component mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await getAvailableVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].id);
        }
      } catch (err) {
        console.error('Failed to load voices:', err);
        
        // Handle specific API key errors during voice loading
        if (err.message?.includes('ElevenLabs API key')) {
          setError('🔑 ElevenLabs API key is invalid or missing. Please check the server configuration and update the ELEVENLABS_API_KEY in the .env file with a valid key from https://elevenlabs.io/');
        } else {
          setError('Failed to load available voices. Please check your internet connection and server configuration.');
        }
      }
    };
    loadVoices();
  }, []);

  const handleGeneratePodcast = async () => {
    if (!selectedVoice) {
      setError('Please select a voice for the podcast');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedPodcast(null);
    setProgress(0);
    setProgressMessage('Starting podcast generation...');

    try {
      const options = {
        voiceStyle: selectedVoice,
        category: selectedCategory,
        location: selectedLocation,
        style: selectedVoice.includes('casual') ? 'casual' : 'professional'
      };

      console.log('Generating podcast with options:', options);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 10, 90);
          
          if (newProgress < 30) {
            setProgressMessage('Fetching latest news articles...');
          } else if (newProgress < 60) {
            setProgressMessage('Generating podcast script...');
          } else if (newProgress < 90) {
            setProgressMessage('Converting text to speech...');
          }
          
          return newProgress;
        });
      }, 2000);

      const podcast = await generatePodcast(options);
      
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Podcast generated successfully!');
      
      console.log('Podcast generated successfully:', podcast);
      setGeneratedPodcast(podcast);
      
    } catch (err) {
      console.error('Podcast generation failed:', err);
      setProgress(0);
      setProgressMessage('');
      
      // Handle specific error types
      let errorMessage = 'Failed to generate podcast';
      
      if (err.message?.includes('timeout') || err.message?.includes('took too long')) {
        errorMessage = '⏱️ Generation timed out. This can happen with longer content. Try selecting fewer articles or a different category.';
      } else if (err.message?.includes('ElevenLabs API key')) {
        errorMessage = '🔑 The ElevenLabs API key is invalid or expired. Please check the server configuration and update the ELEVENLABS_API_KEY in the .env file with a valid key from https://elevenlabs.io/';
      } else if (err.message?.includes('Rate limit')) {
        errorMessage = '🚦 Rate limit exceeded. Please wait a few minutes before trying again.';
      } else if (err.message?.includes('Failed to fetch news')) {
        errorMessage = 'Unable to fetch latest news. Please try again later.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 3000);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef) return;

    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!generatedPodcast) return;
    
    const downloadUrl = getPodcastDownloadUrl(generatedPodcast.filename);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${selectedCategory}_news_${new Date().toISOString().split('T')[0]}.mp3`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-300 mb-4">
          🎙️ AI News Podcast Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Generate personalized news podcasts with AI-powered voices. Select your preferences and create 
          engaging audio content from the latest headlines.
        </p>
        
        {/* API Requirements Notice */}
        <div className="mt-4 max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                        rounded-lg p-3 text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Requires ElevenLabs API key for text-to-speech generation</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Configuration Panel */}
      <motion.div 
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-6">
          Podcast Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice Style
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
            {selectedVoice && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {voices.find(v => v.id === selectedVoice)?.description}
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              News Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Region
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {LOCATIONS.map((location) => (
                <option key={location.code} value={location.code}>
                  {location.flag} {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGeneratePodcast}
            disabled={loading || !selectedVoice}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                     hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500
                     text-white font-medium rounded-lg shadow-md hover:shadow-lg 
                     transform hover:scale-[1.02] transition-all duration-200
                     disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating Podcast...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🎙️ Generate Podcast
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div 
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                   rounded-lg p-4 text-red-700 dark:text-red-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium mb-1">Podcast Generation Failed</div>
              <div className="text-sm">{error}</div>
              {error.includes('ElevenLabs API key') && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-800/30 rounded border border-red-200 dark:border-red-700">
                  <div className="text-xs font-medium mb-2">🔧 How to fix this:</div>
                  <ol className="text-xs space-y-1 list-decimal list-inside">
                    <li>Get a new API key from <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800 dark:hover:text-red-200">ElevenLabs.io</a></li>
                    <li>Update the <code className="bg-red-200 dark:bg-red-700 px-1 rounded">ELEVENLABS_API_KEY</code> in your server's <code className="bg-red-200 dark:bg-red-700 px-1 rounded">.env</code> file</li>
                    <li>Restart the server</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Generated Podcast Player */}
      {generatedPodcast && (
        <motion.div 
          className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-4">
            Your Podcast is Ready! 🎉
          </h2>

          {/* Audio Player */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <audio
              ref={setAudioRef}
              src={getPodcastStreamUrl(generatedPodcast.filename)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full"
              controls
            />
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                         text-white rounded-lg transition-all"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                         text-white rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Podcast Details */}
          {generatedPodcast.script && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-purple-600 dark:text-purple-300 
                               hover:text-purple-800 dark:hover:text-purple-100">
                View Podcast Script
              </summary>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {generatedPodcast.script}
              </div>
            </details>
          )}

          {/* Articles Used */}
          {generatedPodcast.articles && generatedPodcast.articles.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-purple-600 dark:text-purple-300 
                               hover:text-purple-800 dark:hover:text-purple-100">
                Articles Used ({generatedPodcast.articles.length})
              </summary>
              <div className="mt-2 space-y-2">
                {generatedPodcast.articles.map((article, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {article.title}
                    </h4>
                    {article.source && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Source: {article.source}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </motion.div>
      )}

      {/* Loading Progress Display */}
      {loading && (
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                   rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {progressMessage || 'Generating podcast...'}
            </span>
          </div>
          
          {progress > 0 && (
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>This may take 2-5 minutes depending on content length</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
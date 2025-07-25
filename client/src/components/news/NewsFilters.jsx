import React from 'react';
import { useFilters } from '../../context/FiltersContext';
import { useSpeechMode } from '../../context/SpeechModeContext';
import { startListening, stopListening, speak } from '../../services/speechService';
import { CATEGORIES, LOCATIONS } from '../../constants/newsConfig';
import axios from 'axios';

export default function NewsFilters({ onFiltersChange }) {
  const { filters, setFilters } = useFilters();
  const { speechMode, listening, setListening, speaking, setSpeaking } = useSpeechMode();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleVoiceInput = async () => {
    setListening(true);
    setError(null);

    try {
      await speak("What kind of news would you like? You can say a category like technology, health, or a place like India or US.");
      
      startListening(
        async (text) => {
          setListening(false);
          const input = text.toLowerCase();
          
          // Check if input matches a category
          const category = CATEGORIES.find(c => 
            input.includes(c.value) || input.includes(c.label.toLowerCase())
          );
          
          // Check if input matches a location
          const location = LOCATIONS.find(l => 
            input.includes(l.code.toLowerCase()) || 
            input.includes(l.name.toLowerCase())
          );
          
          const newFilters = {
            ...filters,
            category: category?.value || '',
            location: location?.code || 'GLOBAL'
          };
          
          setFilters(newFilters);
          onFiltersChange(newFilters);
          
          setSpeaking(true);
          await speak(`Showing ${category ? category.label : 'all'} news from ${location ? location.name : 'around the world'}`);
          setSpeaking(false);
        },
        (error) => {
          setError(`Speech recognition error: ${error}`);
          setListening(false);
        }
      );
    } catch (err) {
      setError('Speech synthesis error. Please try text mode.');
      setListening(false);
    }
  };

  const handleCategoryChange = (e) => {
    const newFilters = {
      ...filters,
      category: e.target.value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLocationChange = async (e) => {
    const location = e.target.value;
    setLoading(true);
    setError(null);

    try {
      if (location === 'AUTO') {
        await detectUserLocation();
      } else {
        const newFilters = {
          ...filters,
          location
        };
        setFilters(newFilters);
        onFiltersChange(newFilters);
      }
    } catch (err) {
      setError('Could not update location. Using Global news instead.');
      const newFilters = {
        ...filters,
        location: 'GLOBAL'
      };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    } finally {
      setLoading(false);
    }
  };

  const detectUserLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Use Nominatim for reverse geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      const countryCode = response.data.address.country_code.toUpperCase();
      const supported = LOCATIONS.find(l => l.code === countryCode);
      
      const newFilters = {
        ...filters,
        location: supported ? countryCode : 'GLOBAL'
      };
      
      setFilters(newFilters);
      onFiltersChange(newFilters);
    } catch (err) {
      throw new Error('Location detection failed');
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg backdrop-blur-md">
      {speechMode ? (
        <div className="text-center space-y-4">
          <button
            onClick={handleVoiceInput}
            disabled={listening || speaking}
            className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 
                     disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
          >
            {listening ? (
              <>🎤 Listening...</>
            ) : speaking ? (
              <>🔊 Speaking...</>
            ) : (
              <>🎤 Tap to Speak</>
            )}
          </button>
          
          {/* Show current filters */}
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Category: {CATEGORIES.find(c => c.value === filters.category)?.label || 'All'}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Location: {LOCATIONS.find(l => l.code === filters.location)?.name || 'Global'}
            </span>
          </div>
        </div>
      ) : (
        /* Existing filter controls */
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-800 
                       bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-500
                       disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(({ value, label, icon }) => (
                <option key={value} value={value}>
                  {icon} {label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Region
            </label>
            <select
              value={filters.location}
              onChange={handleLocationChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-800 
                       bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-500
                       disabled:opacity-50"
            >
              {LOCATIONS.map(({ code, name, flag }) => (
                <option key={code} value={code}>
                  {flag} {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Selected:</span>
          <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 
                         text-purple-700 dark:text-purple-300 font-medium">
            {CATEGORIES.find(c => c.value === filters.category)?.label || 'All'} 
            {CATEGORIES.find(c => c.value === filters.category)?.icon}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 
                         text-purple-700 dark:text-purple-300 font-medium">
            {LOCATIONS.find(l => l.code === filters.location)?.name}
            {LOCATIONS.find(l => l.code === filters.location)?.flag}
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Updating location...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
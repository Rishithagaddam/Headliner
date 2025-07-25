// Client-side podcast service for API communication
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get available voices for podcast generation
 */
export const getAvailableVoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/podcast/voices`);
    return response.data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw new Error('Failed to fetch available voices');
  }
};

/**
 * Generate a news podcast
 */
export const generatePodcast = async (options) => {
  try {
    console.log('Generating podcast with options:', options);
    
    const response = await axios.post(`${API_BASE_URL}/api/podcast/generate`, options, {
      timeout: 600000, // Increased to 10 minutes to accommodate longer generation times
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Podcast generated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating podcast:', error);
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Request timeout. The audio generation took too long. Try reducing the number of articles or try again later.');
    }
    
    // Handle server errors with better messages
    if (error.response?.status === 500) {
      const serverError = error.response?.data?.error;
      if (serverError?.includes('ElevenLabs API key')) {
        throw new Error('Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY in .env file');
      } else if (serverError?.includes('timeout')) {
        throw new Error('Server timeout. Please try generating a shorter podcast or try again later');
      } else if (serverError?.includes('Failed to generate audio for chunk')) {
        throw new Error('Audio generation failed. This might be due to network issues or API limits. Please try again with fewer articles.');
      } else if (serverError?.includes('Rate limit')) {
        throw new Error('API rate limit exceeded. Please wait a few minutes before trying again.');
      } else {
        throw new Error(serverError || 'Server error occurred during podcast generation');
      }
    } else if (error.response?.status === 408) {
      throw new Error('Request timeout. The podcast generation is taking too long. Try selecting fewer articles.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to generate podcast');
  }
};

/**
 * Get podcast details
 */
export const getPodcastDetails = async (filename) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/podcast/details/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching podcast details:', error);
    throw new Error('Failed to fetch podcast details');
  }
};

/**
 * Get stream URL for a podcast
 */
export const getPodcastStreamUrl = (filename) => {
  return `${API_BASE_URL}/api/podcast/stream/${filename}`;
};

/**
 * Get download URL for a podcast
 */
export const getPodcastDownloadUrl = (filename) => {
  return `${API_BASE_URL}/api/podcast/download/${filename}`;
};

/**
 * Download podcast file
 */
export const downloadPodcast = async (filename, customName = null) => {
  try {
    const downloadUrl = getPodcastDownloadUrl(filename);
    
    // Create a temporary link element for download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = customName || filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading podcast:', error);
    throw new Error('Failed to download podcast');
  }
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in minutes and seconds
 */
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

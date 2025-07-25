import React from 'react';
import { useSpeechMode } from '../../context/SpeechModeContext';

export default function SpeechToggle() {
  const { speechMode, setSpeechMode, listening, speaking } = useSpeechMode();

  return (
    <button
      onClick={() => setSpeechMode(!speechMode)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${speechMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 dark:bg-gray-800 text-purple-600 dark:text-purple-300'}`}
    >
      {listening ? (
        <span className="flex items-center gap-2">
          <span className="animate-pulse">🎤</span> Listening...
        </span>
      ) : speaking ? (
        <span className="flex items-center gap-2">
          <span className="animate-bounce">🔊</span> Speaking...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {speechMode ? '🎤' : '⌨️'} 
          {speechMode ? 'Voice Mode' : 'Text Mode'}
        </span>
      )}
    </button>
  );
}
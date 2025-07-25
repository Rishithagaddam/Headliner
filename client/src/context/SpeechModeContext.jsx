import React, { createContext, useContext, useState } from 'react';

const SpeechModeContext = createContext();

export function SpeechModeProvider({ children }) {
  const [speechMode, setSpeechMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const value = {
    speechMode,
    setSpeechMode,
    listening,
    setListening,
    speaking,
    setSpeaking
  };

  return (
    <SpeechModeContext.Provider value={value}>
      {children}
    </SpeechModeContext.Provider>
  );
}

export function useSpeechMode() {
  const context = useContext(SpeechModeContext);
  if (!context) {
    throw new Error('useSpeechMode must be used within a SpeechModeProvider');
  }
  return context;
}
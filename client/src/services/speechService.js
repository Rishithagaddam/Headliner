import axios from 'axios';

// Browser Speech Recognition (fallback)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synthesis = window.speechSynthesis;

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyAxtOF7oTK9nTU4TCZHsvEAcdMdUuYehPU";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

export const startListening = (onResult, onError) => {
  if (!recognition) {
    onError('Speech recognition not supported in this browser');
    return;
  }

  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;
    
    // Enhanced processing using Gemini API for better understanding
    try {
      const enhancedText = await enhanceTextWithGemini(text);
      onResult(enhancedText);
    } catch (err) {
      // Fallback to original text if Gemini processing fails
      onResult(text);
    }
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  recognition.start();
};

// Enhanced text processing using Gemini API
const enhanceTextWithGemini = async (text) => {
  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{
          text: `Process this voice input for a news application. Fix any speech recognition errors, correct grammar, and ensure clarity. If it's a news query, optimize it for better results. Keep the original intent but make it more precise.
          
          Input: "${text}"
          
          Return only the processed text, nothing else.`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100
      }
    });

    const enhancedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return enhancedText || text;
  } catch (err) {
    console.error('Gemini text enhancement failed:', err);
    return text;
  }
};

export const stopListening = () => {
  if (recognition) {
    recognition.stop();
  }
};

export const speak = async (text) => {
  return new Promise(async (resolve, reject) => {
    if (!synthesis) {
      reject('Speech synthesis not supported');
      return;
    }

    try {
      // Optimize text for speech using Gemini API
      const optimizedText = await optimizeTextForSpeech(text);
      
      const utterance = new SpeechSynthesisUtterance(optimizedText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = resolve;
      utterance.onerror = reject;
      
      synthesis.speak(utterance);
    } catch (err) {
      // Fallback to original text if optimization fails
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      utterance.onerror = reject;
      synthesis.speak(utterance);
    }
  });
};

// Optimize text for speech synthesis using Gemini API
const optimizeTextForSpeech = async (text) => {
  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{
          text: `Optimize this text for speech synthesis. Make it more conversational, add appropriate pauses with commas, and ensure it sounds natural when spoken aloud. Keep the meaning intact but make it flow better for voice output.
          
          Input: "${text}"
          
          Return only the optimized text for speech, nothing else.`
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 200
      }
    });

    const optimizedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return optimizedText || text;
  } catch (err) {
    console.error('Gemini speech optimization failed:', err);
    return text;
  }
};

export const stopSpeaking = () => {
  if (synthesis) {
    synthesis.cancel();
  }
};

// Alternative speech-to-text using Gemini API for advanced processing
export const processAudioWithGemini = async (audioBlob) => {
  try {
    // Convert audio to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [
          {
            text: "Transcribe this audio to text and optimize it for a news application query:"
          },
          {
            inlineData: {
              mimeType: audioBlob.type,
              data: base64Audio
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200
      }
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (err) {
    console.error('Gemini audio processing failed:', err);
    throw new Error('Audio processing failed');
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Smart intent detection using Gemini API
export const detectIntent = async (text) => {
  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{
          text: `Analyze this user input and determine the intent for a news application. Return a JSON object with:
          {
            "intent": "news_query|chat|category_filter|summary_request",
            "category": "technology|health|sports|business|general|entertainment|science",
            "location": "global|india|us|uk|europe",
            "keywords": ["keyword1", "keyword2"],
            "confidence": 0.0-1.0
          }
          
          User input: "${text}"
          
          Return only the JSON object, nothing else.`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 150
      }
    });

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return JSON.parse(result);
  } catch (err) {
    console.error('Intent detection failed:', err);
    return {
      intent: "chat",
      category: "general",
      location: "global",
      keywords: [],
      confidence: 0.5
    };
  }
};
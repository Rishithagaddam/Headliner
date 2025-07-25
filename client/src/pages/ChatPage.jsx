import React, { useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ShowLatestNews from '../components/news/ShowLatestNews';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechMode } from '../context/SpeechModeContext';
import { startListening, speak, detectIntent } from '../services/speechService';
import axios from 'axios';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! Ask me anything about news or try the quick prompts below!",
      time: new Date(),
      reactions: { up: 0, down: 0 }
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const { speechMode, listening, setListening, speaking, setSpeaking } = useSpeechMode();

  // Quick prompts data
  const quickPrompts = [
    {
      text: "Summarize top tech news",
      icon: "💻"
    },
    {
      text: "Give latest health updates",
      icon: "🏥"
    },
    {
      text: "Any political highlights today?",
      icon: "🏛️"
    },
    {
      text: "Show sports headlines",
      icon: "⚽"
    }
  ];

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const now = new Date();
    const userMsg = { from: "user", text: input, time: now, reactions: { up: 0, down: 0 } };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setUserTyping(false);
    
    try {
      // Use Gemini API for intent detection to enhance the query
      const intent = await detectIntent(input);
      
      // Send the enhanced message to the backend
      const res = await axios.post("http://localhost:5000/chat", { 
        message: input,
        intent: intent // Pass intent data to backend for better processing
      });
      
      const botResponse = { 
        from: "bot", 
        text: res.data.reply, 
        time: new Date(), 
        reactions: { up: 0, down: 0 } 
      };
      
      setMessages((msgs) => [...msgs, botResponse]);
      
      // If speech mode is enabled, speak the response
      if (speechMode) {
        setSpeaking(true);
        try {
          await speak(res.data.reply);
        } catch (err) {
          console.error('Speech synthesis failed:', err);
        } finally {
          setSpeaking(false);
        }
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Error contacting Gemini API.", time: new Date(), reactions: { up: 0, down: 0 } }
      ]);
    }
    setInput("");
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        from: "bot",
        text: "👋 Hi! Ask me anything or try 'latest news'.\n\n💡 Tip: Use the 'Show Latest News' button for headlines.",
        time: new Date(),
        reactions: { up: 0, down: 0 }
      }
    ]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const reactToMessage = (idx, type) => {
    setMessages(msgs =>
      msgs.map((msg, i) =>
        i === idx
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [type]: msg.reactions[type] + 1
              }
            }
          : msg
      )
    );
  };

  const handleQuickPrompt = async (promptText) => {
    // Set the input
    setInput(promptText);
    
    // Simulate a message send
    const now = new Date();
    const userMsg = { 
      from: "user", 
      text: promptText, 
      time: now, 
      reactions: { up: 0, down: 0 } 
    };
    
    setMessages(msgs => [...msgs, userMsg]);
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5000/chat", { 
        message: promptText 
      });
      setMessages(msgs => [
        ...msgs,
        { 
          from: "bot", 
          text: res.data.reply, 
          time: new Date(), 
          reactions: { up: 0, down: 0 } 
        }
      ]);
    } catch (err) {
      setMessages(msgs => [
        ...msgs,
        { 
          from: "bot", 
          text: "Error contacting Gemini API.", 
          time: new Date(), 
          reactions: { up: 0, down: 0 } 
        }
      ]);
    }
    
    setInput("");
    setLoading(false);
  };

  // Voice input handler using enhanced Gemini-powered speech recognition
  const handleVoiceInput = () => {
    if (listening) return;
    
    setListening(true);
    startListening(
      async (recognizedText) => {
        setListening(false);
        setInput(recognizedText);
        
        // Auto-send if in speech mode
        if (speechMode) {
          // Create a fake event to trigger sendMessage
          const fakeEvent = { preventDefault: () => {} };
          setInput(recognizedText);
          // Use setTimeout to ensure state is updated
          setTimeout(() => {
            sendMessage(fakeEvent);
          }, 100);
        }
      },
      (error) => {
        setListening(false);
        console.error('Speech recognition error:', error);
        // You could show an error message to the user here
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-4">
            Chat with Gemini News Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ask questions about current events, get news summaries, or discuss any topic with our AI assistant.
          </p>
        </motion.div>

        {/* Main Chat Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Prompts */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 
                           hover:bg-purple-200 dark:hover:bg-purple-800 rounded-lg transition-all
                           text-purple-700 dark:text-purple-300 text-sm font-medium"
                >
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <ChatWindow
            messages={messages}
            loading={loading}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            userTyping={userTyping}
            clearChat={clearChat}
            copyToClipboard={copyToClipboard}
            reactToMessage={reactToMessage}
            speechMode={speechMode}
            listening={listening}
            handleVoiceInput={handleVoiceInput}
          />

          {/* Collapsible News Section */}
          <div className="mt-8">
            <button
              onClick={() => setShowNews(!showNews)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-100 
                       dark:bg-purple-900/50 rounded-t-xl text-purple-700 dark:text-purple-300 
                       hover:bg-purple-200 dark:hover:bg-purple-800/70 transition-all"
            >
              <span>{showNews ? "Hide Latest News" : "Show Latest News"}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showNews ? "rotate-180" : ""
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {showNews && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-b-xl p-6 shadow-lg">
                    <ShowLatestNews />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}